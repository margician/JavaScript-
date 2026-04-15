import hashlib
import hmac
import uuid
import time
from urllib.parse import urlparse


def generate_hmac_signature(secret: str, message: str) -> str:
    """
    对应原代码中的 function s(e, t)
    使用 HMAC-SHA256 算法生成签名
    """
    # 将密钥和消息编码为 UTF-8 字节
    key_bytes = secret.encode("utf-8")
    message_bytes = message.encode("utf-8")

    # 计算 HMAC-SHA256 签名
    signature = hmac.new(key_bytes, message_bytes, hashlib.sha256).digest()

    # 将签名结果转换为十六进制字符串
    return "".join(f"{byte:02x}" for byte in signature)


def generate_request_auth(params: dict) -> dict:
    """
    对应原代码中的 function l(e)
    生成请求所需的认证信息（时间戳、随机数、签名）
    """
    # 提取参数
    url = params["url"]
    method = params.get("method", "GET")  # 默认 GET
    body_text = params.get("bodyText", "")
    is_upload = params.get("isUpload", False)
    secret = params["secret"]

    # 1. 解析 URL 获取路径和查询参数
    parsed_url = urlparse(url)
    path = parsed_url.path
    query = parsed_url.query  # 自动去掉了开头的 "?"

    # 2. 生成时间戳（秒级）
    timestamp = str(int(time.time()))

    # 3. 生成随机数（UUID 去掉横线）
    nonce = uuid.uuid4().hex  # 等价于 replace(/-/g, "")

    # 4. 计算请求体的 SHA-256 哈希
    if is_upload:
        # 上传模式使用空字符串的 SHA-256 哈希（固定值）
        body_hash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    else:
        # 计算 body_text 的 SHA-256 哈希
        body_bytes = body_text.encode("utf-8")
        body_hash = hashlib.sha256(body_bytes).hexdigest()

    # 5. 拼接待签名字符串
    sign_string = (
        f"{method.upper()}\n"
        f"{path}\n"
        f"{query}\n"
        f"{body_hash}\n"
        f"{timestamp}\n"
        f"{nonce}"
    )
    # 6. 生成最终签名
    signature = generate_hmac_signature(secret, sign_string)

    # 返回认证信息
    return {
        "timestamp": timestamp,
        "nonce": nonce,
        "signature": signature
    }


if __name__ == '__main__':
    import requests
    auth_params = generate_request_auth({
        "url": "https://chanyeos.com/ike2b/industry/atlas/industry_company_table",
        "method": "POST",
        "bodyText": '{"area_code_list":["000000"],"industry_code_list":["INB9938"],"page_number":1,"page_size":15}',
        "isUpload": False,
        "secret": "m74jGJeJLLSkLtSDNwSj5kGeCTXtIXMT7tY9D2lEzPup98P3"
    })
    headers = {
        'accept': '*/*',
        'accept-language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7,zh-TW;q=0.6',
        'authorization': 'Bearer 1aav35nfA11IbjzplPHMOOrT7HfMAAm4xglIVNyUfG',
        'cache-control': 'no-cache',
        'content-type': 'application/json',
        'nonce': f'{auth_params['nonce']}',
        'origin': 'https://chanyeos.com',
        'pragma': 'no-cache',
        'priority': 'u=1, i',
        'referer': 'https://chanyeos.com/smart-ke-b/',
        'sec-ch-ua': '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'signature': f'{auth_params['signature']}',
        'timestamp': f'{auth_params['timestamp']}',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
        # 'cookie': 'Hm_lvt_bea82699dadcee2823f88e04004beefe=1775802633; HMACCOUNT=9B4953A997150B50; Hm_lpvt_bea82699dadcee2823f88e04004beefe=1775810322',
    }

    json_data = {
        'area_code_list': [
            '000000',
        ],
        'industry_code_list': [
            'INB9938',
        ],
        'page_number': 1,
        'page_size': 15,
    }

    response = requests.post(
        'https://chanyeos.com/ike2b/industry/atlas/industry_company_table',
        headers=headers,
        json=json_data,
    )
    print(response.json())