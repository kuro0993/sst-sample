import * as sst from '@serverless-stack/resources';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Duration } from 'aws-cdk-lib';

export default class AuthStack extends sst.Stack {

  public readonly auth;

  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    /*
     * Create Cognito
     */
    const clientWriteAttributes = (new cognito.ClientAttributes())
      .withStandardAttributes({ fullname: true, email: true })
      .withCustomAttributes('mobileAppUserId');

    const clientReadAttributes = clientWriteAttributes
      .withStandardAttributes({ emailVerified: true })
      .withCustomAttributes('mobileAppUserId');
    this.auth = new sst.Auth(this, 'Auth', {
      cognito: {
        userPool: {
          // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_cognito.UserPoolClient.html
          signInAliases: { email: true, username: true },
          selfSignUpEnabled: true,
          // userVerification: {
          //   emailSubject: 'Verify your email for our awesome app!',
          //   emailBody: 'Thanks for signing up to our awesome app! Your verification code is {####}',
          //   emailStyle: cognito.VerificationEmailStyle.CODE,
          //   smsMessage: 'Thanks for signing up to our awesome app! Your verification code is {####}',
          // },
          standardAttributes: {
            email: { mutable: true, required: true },
            phoneNumber: { mutable: true, required: false },
          },
          customAttributes: {
            'mobileAppUserId': new cognito.StringAttribute({ minLen: 6, maxLen: 16, mutable: false }),
            'webAppUserId': new cognito.StringAttribute({ minLen: 6, maxLen: 16, mutable: false })
          },
          accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
          enableSmsRole: true,
          mfa: cognito.Mfa.OPTIONAL,
          mfaSecondFactor: { sms: true, otp: true },
          passwordPolicy: {
            minLength: 6,
            requireLowercase: true,
            requireUppercase: true,
            requireDigits: true,
            requireSymbols: false,
          }
        },
        userPoolClient: {
          // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_cognito.UserPoolClient.html
          userPoolClientName: 'myMobileApp',
          enableTokenRevocation: true, // トークン取り消しの有効/無効
          preventUserExistenceErrors: false, // ユーザが存在しない場合にUserNotFoundExceptionを返すかどうか
          accessTokenValidity: Duration.days(1),     // Access Token
          idTokenValidity: Duration.days(1),         // ID Token
          refreshTokenValidity: Duration.days(3600), // Refresh Token (10 year)
          writeAttributes: clientWriteAttributes,    // 書き込み可能な属性
          readAttributes: clientReadAttributes,      // 読込可能な属性
          /*
           * supportedIdentityProviders: [
           *   cognito.UserPoolClientIdentityProvide.
           * ]
           */
        }
        /*
         * triggers:{
         *   preAuthentication: 'src/cognito/preAuthentication.main',
         *   customEmailSender: 'src/cognito/customEmailSender.main',
         *   preSignUp: 'src/cognito/preSignUp.main',
         * }
         */
      },
    })

    /*
     * Show the endpoint in the output
     */
    this.addOutputs({
      UserPoolId: this.auth.cognitoUserPool?.userPoolId + '',
      IdentityPoolId: this.auth.cognitoIdentityPoolId,
      UserPoolClientId: this.auth.cognitoUserPoolClient?.userPoolClientId + '',
    });
  }
}
