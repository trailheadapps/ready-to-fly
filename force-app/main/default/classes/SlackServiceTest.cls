@isTest
private with sharing class SlackServiceTest {
    @isTest
    static void postMessagesSuccess() {
        // GIVEN
        Test.setMock(HttpCalloutMock.class, new HttpCalloutMockImpl());

        // WHEN
        Test.startTest();
        SlackService.postMessages('Slack rocks!');
        Test.stopTest();

        // THEN
        System.assert(true, 'No exception expected');
    }

    @isTest
    static void postMessagesFailure() {
        // GIVEN
        String message = 'Slack rocks!';
        HttpCalloutMockImpl mock = new HttpCalloutMockImpl();
        mock.throwError = true;
        Test.setMock(HttpCalloutMock.class, mock);

        try {
            // WHEN
            Test.startTest();
            SlackService.postMessages(message);
            Test.stopTest();
            System.assert(false, 'Exception expected');
        } catch (Exception e) {
            // THEN
            System.assert(
                e instanceof SlackService.SlackException,
                'SlackException exception expected'
            );
            String expectedMessage =
                'Failed to post messages to Slack: HTTP500 Failure - ' +
                message;
            System.assertEquals(
                e.getMessage(),
                expectedMessage,
                'Messages are not equal'
            );
        }
    }

    public class HttpCalloutMockImpl implements HttpCalloutMock {
        public Boolean throwError;
        public HTTPResponse respond(HTTPRequest req) {
            // Assert request is correctly built
            Bolt_App_Config__mdt record = SlackService.getBoltAppRecord();
            Blob signature = Crypto.generateMac(
                'HmacSHA256',
                Blob.valueOf(req.getBody()),
                Blob.valueOf(record.HMACKey__c)
            );

            System.assertEquals(
                record.URL__c + '/salesforce/message',
                req.getEndpoint()
            );
            System.assertEquals('POST', req.getMethod());
            System.assertEquals(
                'application/json;charset=UTF-8',
                req.getHeader('Content-Type')
            );
            System.assertEquals(
                EncodingUtil.base64Encode(signature),
                req.getHeader('x-salesforce-signature')
            );

            // Create fake response
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setBody(req.getBody());
            if (throwError == true) {
                res.setStatusCode(500);
                res.setStatus('Failure');
            } else {
                res.setStatusCode(200);
                res.setStatus('Success');
            }
            return res;
        }
    }
}
