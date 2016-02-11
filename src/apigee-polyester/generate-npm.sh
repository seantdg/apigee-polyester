rm -rf ./npm
mkdir ./npm

cp ./apigee-polyester.js ./npm/apigee-polyester.js
cp ./apigee-polyester-gherkin.js ./npm/apigee-polyester-gherkin.js
cp ../package.json ./npm/package.json
cp ../../LICENSE ./npm/LICENSE
cp ../../README.md ./npm/README.md

cd ./npm
npm publish

rm -rf ../npm
