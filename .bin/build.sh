
cleanClient() {
    cd /app/client && rm -rf node_modules && rm -rf build
}

cleanAPI() {
    cd /app/api && rm -rf node_modules && rm -rf public/*
}

buildClient() {
    cd /app/client && \
    npm install && \
    npm run-script build && \
    mkdir -p /app/api/public && \
    mv /app/client/build/* /app/api/public && \
    mv /app/api/public/index.html /app/api/public/something-else.html
}

echo "cleaning"
cleanAPI
cleanClient
echo "building"
buildClient
echo "all done!"
