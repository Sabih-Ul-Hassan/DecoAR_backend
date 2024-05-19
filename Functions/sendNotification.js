const FCM = require('fcm-node');
const serverKey = 'AAAArsMb_jk:APA91bEjTKVzsNvfF85XTS1d686kGWp9yFWH6LQ680CBfWBDQ0R5M82G2tFZqhBTYvWgOel7dyaRv9GI22HWpMxqmUYPodLD4ZAgpfcKxJfeXD18iireQYhJYXaZD8MAEViEhcq1fkao'; 

const fcm = new FCM(serverKey);


const sendNotification = (registrationToken, title, body, data) => {
    const message = {
      to: registrationToken,
      notification: {
        title: title,
        body: body,
      },
      data: data || {},
    };
  
    fcm.send(message, (err, response) => {
      if (err) {
        console.error('Error sending message:', err);
      } else {
        console.log('Successfully sent message:', response);
      }
    });
  };
  module.exports={sendNotification}
