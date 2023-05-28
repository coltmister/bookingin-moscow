import json
import re
from uuid import UUID

import requests
from dadata import Dadata
from django.core.cache import cache

from core.utils.notification import telegram_message
from settings.settings import DADATA_API, DADATA_SECRET, OPEN_AI_API, SIMPLECLOUD_TOKEN, SIMPLECLOUD_URL
from site_territory.underground import UNDERGROUND_DICT, UNDERGROUND_LIST


def dadata_wrapper(item):
    city = item['data']['city'] or ''
    street = item['data']['street'] or ''
    street_type = item['data']['street_type_full'] or ''
    house_type = item['data']['house_type'] or ''
    house = item['data']['house'] or ''
    block_type = item['data']['block_type'] or ''
    block = item['data']['block'] or ''
    latitude = item['data']['geo_lat']
    longitude = item['data']['geo_lon']
    return {
        "address": f"{city}{', ' if (street and street_type) else ''}{street} {street_type}{', ' if (house_type and house) else ''}{house_type} {house} {block_type} {block}".strip(),
        "coords": {"latitude": latitude, "longitude": longitude}
    }


def suggest_address(address, count=3):
    try:
        data = cache.get(address)
        if not data:
            with Dadata(DADATA_API, DADATA_SECRET) as dadata:
                result = dadata.suggest("address", address, count)
                answer = []
                for item in result:
                    answer.append(dadata_wrapper(item))
            cache.set(address, answer)
            return answer
        return data
    except Exception as error:
        raise Exception("Не удалось получить координаты по адресу")


def set_domain_name(subdomain_name):
    payload = json.dumps({
        "name": f"{subdomain_name}.bookingin.moscow",
        "data": "89.232.160.176",
        "type": "A",
        "priority": None,
        "port": None,
        "weight": None
    })
    headers = {
        'Authorization': SIMPLECLOUD_TOKEN,
        'Content-Type': 'application/json'
    }
    try:
        response = requests.request("POST", SIMPLECLOUD_URL, headers=headers, data=payload)
        res_json = response.json()
        if res_json.get("error"):
            raise Exception(res_json.get("error_details"))
        return True
    except Exception as error:
        telegram_message(f"Не удалось добавить доменное имя. Попробуйте позже. Ошибка: {error}")
        raise Exception("Не удалось добавить доменное имя. Попробуйте позже")


def get_underground_stations(return_dict=False):
    if return_dict:
        answer = UNDERGROUND_DICT
    else:
        answer = UNDERGROUND_LIST
    return answer


def suggest_sites(query):
    from langchain import OpenAI, PromptTemplate, SQLDatabase, SQLDatabaseChain

    # text-davinci-003
    db = SQLDatabase.from_uri("sqlite:///tmp_db.db", include_tables=['query_results'])
    llm = OpenAI(verbose=True, model_name="text-davinci-003",
                 openai_api_key=OPEN_AI_API)

    _DEFAULT_TEMPLATE = """
    1. Given an input question, first create a syntactically correct {dialect} query to run use template do not include additional where clause.
    Template: 'SELECT DISTINCT id FROM query_results WHERE brief_description LIKE %слово1% OR brief_description LIKE %слово2%;'
    2. Look at the results of the query and return the answer. Return your answer as ids of the rows that match the query through |.
        Use the following format:

        Question: "Question here"
        SQLQuery: "SQL Query to run"
        Answer: "Final answer here"
        
        Only use the following tables:
        - query_results
        Question: {input}"""
    PROMPT = PromptTemplate(
        input_variables=["input", "dialect"], template=_DEFAULT_TEMPLATE
    )

    db_chain = SQLDatabaseChain.from_llm(llm, db, prompt=PROMPT, verbose=True, use_query_checker=True, top_k=5)
    answer = db_chain.run(query)
    answer_list = extract_uuids(answer)
    if not answer_list:
        return "Не нашел", []
    return "Нашел", answer_list


def extract_uuids(input_string):
    uuids = re.findall(r'[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}', input_string, re.I)
    return [str(UUID(uuid)) for uuid in uuids]
