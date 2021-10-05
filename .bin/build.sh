
cleanClient() {
    cd /app/client && rm -rf node_modules && rm -rf build
}

cleanAPI() {
    cd /app/api && rm -rf node_modules && rm -rf rest/public
}

buildClient() {
    cd /app/client && \
    npm install && \
    npm run-script build && \
    mkdir -p /app/api/rest/public && \
    mv /app/client/build/* /app/api/rest/public && \
    mv /app/api/rest/public/index.html /app/api/rest/public/something-else.html
}

echo "cleaning"
cleanAPI
cleanClient
echo "building"
buildClient
echo "all done!"
