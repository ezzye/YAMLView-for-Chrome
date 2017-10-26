/**
 * Created by ellioe03 on 26/10/2017.
 */
var test, nativeObject,nativeObject2, test, yamlString, yamlString2

test = "myStuff: youBet";

nativeObject = YAML.parse(test);


yamlString = YAML.stringify(nativeObject,4);

nativeObject2 = YAML.load('/Users/ellioe03/workspace/YAMLView-for-Chrome/spec/fixture/example.yml')

yamlString2 = YAML.stringify(nativeObject2,4);

console.log("I am here you all!");

console.log(yamlString);

console.log(yamlString2);






