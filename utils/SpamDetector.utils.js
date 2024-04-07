import * as tf from '@tensorflow/tfjs-node';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
import fetch from 'node-fetch';
global.fetch = fetch;
import * as DICTIONARY from '../ai-models/dictionary.js';

// The number of input elements the ML Model is expecting.
const ENCODING_LENGTH = 20;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SPAM_THRESHOLD = 0.75;

export default class SpamDetector {
    constructor(text) {
        this.text = text;
    }

    MODEL_PATH = path.resolve(__dirname, '../ai-models/model.json');

    async execute(text) {
        try {
            let lowercaseSentenceArray = text.toLowerCase().replace(/[^\w\s]/g, ' ').split(' ');
            lowercaseSentenceArray = lowercaseSentenceArray.slice(0, ENCODING_LENGTH - 1);
            let tokenized = this.tokenize(lowercaseSentenceArray);
            const model = await tf.loadLayersModel(`file://${this.MODEL_PATH}`);
            var results = await model.predict(tokenized);
            const data = await results.data();
            if (data[1] >= SPAM_THRESHOLD) {
                return true;
            } 
            return false;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    tokenize(wordArray) {
        // Always start with the START token.
        let returnArray = [DICTIONARY.START];
        
        // Loop through the words in the sentence you want to encode.
        // If word is found in dictionary, add that number else
        // you add the UNKNOWN token.
        for (var i = 0; i < wordArray.length; i++) {
          let encoding = DICTIONARY.LOOKUP[wordArray[i]];
          returnArray.push(encoding === undefined ? DICTIONARY.UNKNOWN : encoding);
        }
        
        // Finally if the number of words was < the minimum encoding length
        // minus 1 (due to the start token), fill the rest with PAD tokens.
        while (i < ENCODING_LENGTH - 1) {
          returnArray.push(DICTIONARY.PAD);
          i++;
        }
        
        // Log the result to see what you made.
        console.log([returnArray]);
        
        // Convert to a TensorFlow Tensor and return that.
        return tf.tensor([returnArray]);
      }
}

