#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsCognitoAuthStack } from '../lib/aws-cognito-auth-stack';

const app = new cdk.App();
new AwsCognitoAuthStack(app, 'AwsCognitoAuthStack');
