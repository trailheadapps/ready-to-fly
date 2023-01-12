public class SlackService {
    @future(callout=true)
    public static void postMessages(String messagesJson) {
        HttpResponse response = sendRequest(messagesJson);

        if (response.getStatusCode() != 200) {
            throw new SlackException(
                'Failed to post messages to Slack: HTTP' +
                    response.getStatusCode() +
                    ' ' +
                    response.getStatus() +
                    ' - ' +
                    response.getBody()
            );
        }
    }

    @TestVisible
    private static Bolt_App_Config__mdt getBoltAppRecord() {
        Bolt_App_Config__mdt config = Bolt_App_Config__mdt.getInstance(
            'BoltAppConfigHeroku'
        );
        if (config == null) {
            if (Test.isRunningTest()) {
                return new Bolt_App_Config__mdt(
                    HMACKey__c = 'AKeCiu6WIcy1YtbTnvtEULZraPEuBFQh'
                );
            } else {
                throw new SlackException(
                    'Failed to post messages to Slack: missing BoltAppConfigHeroku Bolt_App_Config__mdt record'
                );
            }
        }
        return config;
    }

    private static HttpResponse sendRequest(String body) {
        // Get Bolt App URL and HMAC Key
        Bolt_App_Config__mdt record = getBoltAppRecord();
        Blob signature = Crypto.generateMac(
            'HmacSHA256',
            Blob.valueOf(body),
            Blob.valueOf(record.HMACKey__c)
        );

        HttpRequest request = new HttpRequest();
        request.setEndpoint('callout:boltApp/salesforce/message');
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json;charset=UTF-8');
        request.setHeader(
            'x-salesforce-signature',
            EncodingUtil.base64Encode(signature)
        );
        request.setBody(body);
        return new Http().send(request);
    }

    public class SlackException extends Exception {
    }
}
