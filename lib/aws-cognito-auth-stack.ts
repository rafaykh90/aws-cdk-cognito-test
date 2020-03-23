import * as cdk from "@aws-cdk/core";
import * as cognito from "@aws-cdk/aws-cognito";
import { VerificationEmailStyle } from "@aws-cdk/aws-cognito";
import { Duration, Stack } from "@aws-cdk/core";

export class AwsCognitoAuthStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const supportedIdentityProviders = ["COGNITO"];

    // The code that defines your stack goes here
    const userPool: cognito.UserPool = new cognito.UserPool(
      this,
      "kaamyabi-dev-pool",
      {
        userPoolName: "kaamyabi-dev-pool",
        selfSignUpEnabled: true,
        userVerification: {
          emailSubject: "Verify your email for our awesome app!",
          emailBody:
            "Hello {username}, Thanks for signing up to our awesome app! Your verification code is {####}",
          emailStyle: VerificationEmailStyle.CODE,
          smsMessage:
            "Hello {username}, Thanks for signing up to our awesome app! Your verification code is {####}"
        },
        userInvitation: {
          emailSubject: "Invite to join our awesome app!",
          emailBody:
            "Hello {username}, you have been invited to join our awesome app! Your temporary password is {####}",
          smsMessage: "Your temporary password for our awesome app is {####}"
        },
        signInAliases: {
          email: true
        },
        autoVerify: { email: true },
        requiredAttributes: {
          fullname: true,
          email: true,
          profilePicture: true
        },
        passwordPolicy: {
          minLength: 12,
          requireLowercase: true,
          requireUppercase: true,
          requireDigits: true,
          requireSymbols: true,
          tempPasswordValidity: Duration.days(3)
        }
      }
    );

    new cognito.CfnUserPoolGroup(this, "AdminsGroup", {
      groupName: "kaamyabi-admins",
      userPoolId: userPool.userPoolId
    });

    new cognito.CfnUserPoolGroup(this, "UsersGroup", {
      groupName: "kaamyabi-users",
      userPoolId: userPool.userPoolId
    });

    const cfnUserPoolClient = new cognito.CfnUserPoolClient(
      this,
      "CognitoAppClient",
      {
        supportedIdentityProviders: supportedIdentityProviders,
        clientName: "Web",
        allowedOAuthFlowsUserPoolClient: true,
        allowedOAuthFlows: ["code"],
        allowedOAuthScopes: ["phone", "email", "openid", "profile"],
        generateSecret: false,
        refreshTokenValidity: 1,
        callbackUrLs: ["http://localhost:3000/"],
        logoutUrLs: ["http://localhost:3000/"],
        userPoolId: userPool.userPoolId
      }
    );

    const cfnUserPoolDomain = new cognito.CfnUserPoolDomain(
      this,
      "CognitoDomain",
      {
        domain: "kaamyabi-auth-dev",
        userPoolId: userPool.userPoolId
      }
    );

    new cdk.CfnOutput(this, "UserPoolIdOutput", {
      description: "UserPool ID",
      value: userPool.userPoolId
    });

    new cdk.CfnOutput(this, "AppClientIdOutput", {
      description: "App Client ID",
      value: cfnUserPoolClient.ref
    });

    new cdk.CfnOutput(this, "CognitoDomainOutput", {
      description: "Cognito Domain",
      value: cfnUserPoolDomain.domain
    });

    // const app = new cdk.App();
    // const stack = new cdk.Stack(app, "kaamyabi-auth-stack-test", {
    //   stackName: "kaamyabi-auth-stack",
    //   env: { account: "320542485006", region: "eu-west-1" }
    // });

    // //const stack = new Stack(app, 'kaamyabi-auth-stack-dev');

    // const stackProps = {
    //   env: { region: "eu-west-1", account: "320542485006" }
    // };

    // //const awesomePool = cognito.UserPool.fromUserPoolId(stack, 'kaamyabi-dev-pool', 'eu-central-1');
    // const awsCognitoTestStack = new AwsCognitoAuthStack(
    //   app,
    //   stack.stackName,
    //   stackProps
    // );
    // awsCognitoTestStack.templateOptions.transforms = [
    //   "AWS::Serverless-2016-10-31"
    // ];
    // app.synth();
  }
}
