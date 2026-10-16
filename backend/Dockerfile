#start the nodejs 
FROM node:22-alpine 
#set the working directory
WORKDIR /app
#copy package file first 
COPY package*.json ./
#install the depedencies 
RUN npm install
#copy the rest of the backend code
COPY . .
#expose the port your bckned runs on (5000)
EXPOSE 5000
#start the serve
CMD ["npm","start"]