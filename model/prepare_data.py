from utils import *

#download_data(data_folder="corpus/")

prepare_data(data_folder="corpus/",
             euro_parl=True,
             common_crawl=False,
             news_commentary=False,
             min_length=3,
             max_length=150,
             max_length_ratio=2.,
             retain_case=True)
