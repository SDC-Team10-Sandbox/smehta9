import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Function, InlineCode, Runtime } from 'aws-cdk-lib/aws-lambda';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';

import path = require('path');

export class MyLambdaStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const queue = new sqs.Queue(this, 'SampleQueue');
        
        const shellLambda = new Function(this, 'LambdaFunction', {
            code: lambda.Code.fromAsset(path.resolve(__dirname, "lambdas")),
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "lambda.handler",
            timeout: cdk.Duration.seconds(3)
        });

        const eventSource = new lambdaEventSources.SqsEventSource(queue);

        shellLambda.addEventSource(eventSource);

        //Shell Step Function Definition
        const stateMachine = new sfn.StateMachine(this, 'MyStateMachine', {
            definition: new tasks.LambdaInvoke(this, "MyLambdaTask", {
              lambdaFunction: shellLambda
            }).next(new sfn.Succeed(this, "GreetedWorld"))
          });


    
    
        const api = new apigateway.RestApi(this, 'MyLambdaApi', {
        restApiName: 'My Lambda API',
        description: 'This is an example API for Lambda integration',
        });
  
      // Define a resource (root of the API)
        const resource = api.root.addResource('myresource');
    
        // Define a method (e.g., GET) on the resource
        const method = resource.addMethod('GET', new apigateway.LambdaIntegration(shellLambda));
    
        // Output the API endpoint URL
        new cdk.CfnOutput(this, 'ApiEndpoint', {
            value: api.url,
        });

        
    }

}

