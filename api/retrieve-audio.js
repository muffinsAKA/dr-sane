import AWS from 'aws-sdk';
import fetch from 'node-fetch';

AWS.config.update({
    accessKeyId: process.env.s3access,
    secretAccessKey: process.env.s3secret,
});

const s3 = new AWS.S3();

export async function retrieveAudio() {
    try {
      const bucketName = 'muffinsaka';
      const audioFiles = [
        'theme1.mp3',
        'theme2.mp3',
        'theme3.mp3',
        'theme4.mp3',
        'theme5.mp3',
        'theme6.mp3',
        'theme7.mp3',
        'theme8.mp3',
        'theme9.mp3',
        'theme10.mp3',
        'theme11.mp3',
        'theme12.mp3',
        'theme13.mp3',
        'theme14.mp3',
        'theme15.mp3',
        'theme16.mp3',
        'theme17.mp3',
        'theme18.mp3',
        'theme19.mp3',
        'theme20.mp3',
        'theme21.mp3'
      ];
  
      // Select a random audio file
      const randomIndex = Math.floor(Math.random() * audioFiles.length);
      const selectedAudioFile = audioFiles[randomIndex];
  
      // Set the appropriate S3 bucket name and file key
      const fileKey = selectedAudioFile;
  
      // Get the object from S3
      const s3Params = {
        Bucket: bucketName,
        Key: fileKey,
      };
  
      const s3Object = await s3.getObject(s3Params).promise();
  
      // Retrieve the audio data as a base64 string
      const audioData = s3Object.Body.toString('base64');
  
      return audioData;
    } catch (error) {
      console.error(error);
      throw error;
    }
}
  
export default async (req, res) => {
    try {
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Origin', '*');
        const audioData = await retrieveAudio();
        res.send(audioData);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred.' });
    }
};
