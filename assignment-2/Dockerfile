FROM nikolaik/python-nodejs:python3.8-nodejs14

# Set the work directory to /src
WORKDIR /app

# Copyy the node server
COPY ./server /app/server

# Copy the python server
COPY ./clarity /app/clarity

# Copy over the wrapper script
COPY ./wrapper.sh /app

# Copy AWS credentials
COPY .aws /root/.aws

# Install necessary libs
RUN apt update && apt install -y curl libxml2-dev libxslt-dev redis-server

# Install the dependencies for the node server 
RUN npm install --prefix ./server

# Install the dependencies for the python server 
RUN pip install --no-cache-dir -r ./clarity/requirements.txt 

# Download english model for spacy
RUN spacy download en_core_web_sm

# Download NLP related corpora
RUN curl https://raw.githubusercontent.com/codelucas/newspaper/master/download_corpora.py | python

# Give permissions to bash file
RUN ["chmod", "+x", "./wrapper.sh"]

# Set environment variable port to 80
ENV PORT=80

# Expose the applicatoin to the outside world
EXPOSE 80

# Run the wrapper script
CMD ./wrapper.sh


