import pandas as pd
import numpy as np
import re
from nltk.corpus import stopwords
import emoji #emojies libriry
import string #use string functions 
from annotate import annotate
import sys,json

data = sys.stdin.readlines()
#print(len(sys.argv))
#print(str(sys.argv))
#for arg in sys.argv:
  #print(arg)
data = json.loads(data[0])
#args = sys.argv[1:]
#userId = args[1]
#print(userId)
sys.stdout.flush()

dataset = pd.read_csv(data[0])

if (len(dataset) > 10000):
    print ("Tweets > 10000");


# remove punctuations  
arabic_punctuations = '''`÷×؛<>_()*&^%][ـ،/:"؟.,'{}~¦+|!”…“–ـ'''
english_punctuations = string.punctuation
punctuations_list = arabic_punctuations + english_punctuations #all punctuations
#Function Remove Punctuations
def remove_punctuations(text):
    translator = str.maketrans('', '', punctuations_list)
    return text.translate(translator)

#Function Normlize text in arabic
def normalize_arabic(text):
    text = re.sub("[إأآا]", "ا", text)
    text = re.sub("ى", "ي", text)
    text = re.sub("ؤ", "ء", text)
    text = re.sub("ئ", "ء", text)
    text = re.sub("ة", "ه", text)
    text = re.sub("گ", "ك", text)
    return text


ar_stops = set(stopwords.words('arabic'))
ar_stops_fixed=set() #set of stops wrods where آ أ إ is ا    
en_stops= set(stopwords.words('english'))

#ar_stops_fixed = set(ar_stops)
for word in ar_stops:
    word=normalize_arabic(word)
    ar_stops_fixed.add(word)
ar_stops_fixed.add("ما") #try   

# remove repeated letters
def remove_repeating_char(text):
    return re.sub(r'(\w)\1(\1+)', r'\2', text)

#start processing the tweet
def processText(text):
    
    #lower in case of English Text to match stopwords in english:
    text= text.lower() # >Happy :> happy
    
    #Replace @username with empty string
    text = re.sub('@[^\s]+', ' ', text)
    
    # remove repeated letters
    text=remove_repeating_char(text)
    
    # normalize the tweet
    text= normalize_arabic(text) # >أهلا وسهلا :> اهلا وسهلا 
    
    #Convert www.* or https?://* to " "
    text = re.sub('((www\.[^\s]+)|(https://[^\s]+))',' ',text)
    
    #Replace #word with empty string
    text = re.sub(r'#([^\s]+)', ' ', text)

    #Remove new lines with white space
    text = text.replace('\n',' ')
    text = text.replace('\t',' ')
        
    # remove emoji  
    text = emoji.get_emoji_regexp().sub(u'', text)
  
    # remove underscores
    text.replace("_", " ")
    
    # remove extra space
    text = re.sub(' +', ' ',text) 

    #remove rt and cc
    text = re.sub('rt|cc', ' ', text)  
        
    # remove punctuations
    text= remove_punctuations(text) # >hello, hi :> hello hi
    
    # remove stop word
    text = ' '.join([word for word in text.split() if word not in ar_stops_fixed]) #arabic
    text = ' '.join([word for word in text.split() if word not in en_stops]) #english
      
    return text #return cleaned text

def backResult(projectId):
    print(projectId)
    #print('enter back result function')
    return projectId


dataset['cleaned tweet']= dataset['Tweet Content'].apply(lambda x: processText(x))
#remove duplicate tweet
dataset.drop_duplicates(subset=['cleaned tweet'], keep= 'first', inplace=True)
projectId = annotate(dataset)
#print('projectId' +projectId)
backResult(projectId)



