import joblib
from numpy import positive
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
import pandas as pd
from sklearn import metrics
import matplotlib.pyplot as plt
import plotly as py
from collections import Counter #count the number of words 
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from firebase_admin import auth
import datetime
from google.cloud import storage
import arabic_reshaper
from bidi.algorithm import get_display

# Use the application default credentials
cred = credentials.Certificate("electron-5aeb5-firebase-adminsdk-ned7d-f19eb5f7be.json")
project_id = 'electron-5aeb5'
firebase_admin.initialize_app(cred, {
  'projectId': project_id,
})

db = firestore.client()

def load_model():
    model = joblib.load('nb.pkl')
    return model

def annotate_20per(data, model):
    sampled_data =data.sample(frac=0.2, random_state=42) #data.loc[:20].copy() 
    preds = model.predict(sampled_data['cleaned tweet'].tolist())
    
    return create_df(sampled_data, preds)
    
def create_df(X, y):
    X['Label'] = y
    return X

def generate_model(sampled_df, data):
    X_sampled = sampled_df['cleaned tweet']
    y_sampled = sampled_df.Label
    
    modelM = MultinomialNB()

    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1,2))),
        ('model', modelM)
    ])

    
    classifier_nb = pipeline.fit(X_sampled, y_sampled)

        
    preds = classifier_nb.predict(data['cleaned tweet'])#data
    
    return create_df(data, preds)

def save_results(df):
    df['Label'] = df['Label'].apply(lambda x: 'negative' if x<=0 else 'positive')
    df.to_csv('labeled.csv', index=False, encoding='utf-8-sig')# columns=['Tweet Content', 'Label']
    return

def displayVisualizations():
    data_df = pd.read_csv("labeled.csv")
    #show sentiment column as a pie chart
    data_df['Label'] = data_df['Label'].str.lower()
    data_df['Label'].value_counts().plot(kind='pie', subplots=True, shadow = True,startangle=70,figsize=(5,20), autopct='%1.1f%%', colors = ['seagreen', 'crimson'])
    plt.savefig('pieChart.png')
    
    #Most Common Words
    #count positive words
    words = [ word for tokens in data_df["cleaned tweet"] for word in tokens.split()]
    word_counter = Counter(words)
    #Top 15 positive words
    word_counter.most_common(15)
    #store the top 15 words in a new data frame
    lst = word_counter.most_common(15)
    word_df = pd.DataFrame(lst, columns = ['Words', 'Count'])
    
    for idx,row in word_df.iterrows():
      word_df.loc[idx,'Words']=get_display(arabic_reshaper.reshape(word_df.loc[idx,'Words']))
    
    #Set the DataFrame index (row labels) using existing column "Words"
    word_df.set_index('Words', inplace=True)

    #set figure axis and plot it
    fig,axis = plt.subplots()
    axis.tick_params(axis='x', labelsize=15)
    axis.tick_params(axis='y', labelsize=15)
    axis.set_xlabel('Words', fontsize=15)
    axis.set_ylabel('count' , fontsize=15)
    #axis.set_title('The most common positive word', fontsize=15, fontweight='bold')
    BAR=['#b4cdf4','#b4def4','#b4ebf4']
    word_df[:15].plot(ax=axis,kind='bar',figsize=(10, 10),color=BAR)
    plt.savefig('word_df.png')
    
    posData = data_df[data_df['Label'] == "positive"]
    positives =len(posData)

    negData = data_df[data_df['Label'] == "negative"]
    negatives =len(negData)

    projectId = pushResults(positives, negatives)
    return projectId

def pushResults(positives, negatives):
    if positives>negatives:
        generalSentiment = 'إيجابي'
    else:
        generalSentiment = 'سلبي'

    date = datetime.datetime.now() 
    import os
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"]='electron-5aeb5-firebase-adminsdk-ned7d-f19eb5f7be.json'
    client = storage.Client()
    bucket = client.get_bucket('electron-5aeb5.appspot.com') 
    #bucket = storage.bucket()
    import random
    num = random.randint(1, 10000000000000000)
    imageBlob = bucket.blob('project'+str(num)+'/pieChart')
    imageBlob.upload_from_filename('pieChart.png')
    imageBlob.make_public()
    imageUrl = imageBlob.public_url
    imageBlob2 = bucket.blob('project'+str(num)+'/commonWords')
    imageBlob2.upload_from_filename('word_df.png')
    imageBlob2.make_public()
    imageUrl2 = imageBlob2.public_url
    fileBlob = bucket.blob('project'+str(num)+'/Tweets')
    fileBlob.upload_from_filename('labeled.csv')
    fileBlob.make_public()
    fileUrl = fileBlob.public_url
    doc_ref = db.collection(u'projects').document()
    doc_ref.set({
    u'name': u'project1',
    u'date': date,
    u'userId': 'userId',
    u'pieChart': imageUrl,
    u'commonWords': imageUrl2,
    u'tweets': fileUrl,
    u'positives': positives,
    u'negatives': negatives,
    u'general': generalSentiment,
    u'projectId': doc_ref.id
    })

    return doc_ref.id
    
def annotate(data):
    nb_model = load_model()
    sampled_df = annotate_20per(data, nb_model)
    df = generate_model(sampled_df, data)
    save_results(df)
    projectId = displayVisualizations()
    return projectId