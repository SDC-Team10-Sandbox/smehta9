import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import {Secret} from 'aws-cdk-lib/aws-secretsmanager';
import { MyPipelineAppStage } from './smehta9-app-stage';

export class PipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        
        const gitHubRepo = "SDC-Team10-Sandbox/smehta9";

        const gitHubSecretPath = "BCBS/CloudBasedDevOps/dev/github-token";

        const gitHubToken = Secret.fromSecretNameV2(this, 'ImportedSecret', gitHubSecretPath).secretValue;

        const pipeline = new CodePipeline(this, 'Pipeline', {
            pipelineName: 'MyPipeline',
            synth: new ShellStep('Synth', {
                input: CodePipelineSource.gitHub(gitHubRepo, "main", {authentication: gitHubToken}),
                commands: ['npm ci', 'npm run build', 'npx cdk synth'],
            })
        });
        
        const testingStage = pipeline.addStage(new MyPipelineAppStage(this, 'testing', {
            env: { account: "339713131596", region: "us-east-1" }
        }));
        
        testingStage.addPost(new ShellStep("Run Tests", {
            commands: ['npm install', 'npm run test'],
        }));
        
        const deployStage = pipeline.addStage(new MyPipelineAppStage(this, 'deployment', {
            env: { account: "339713131596", region: "us-east-1" }
        }));
        
        deployStage.addPost(new ShellStep("Deployment", {
            commands: ['npm install', 'npm run test'],
        }));
    }
}