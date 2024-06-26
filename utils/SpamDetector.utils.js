import * as tf from '@tensorflow/tfjs-node';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
import fetch from 'node-fetch';
global.fetch = fetch;
import * as DICTIONARY from '../ai-models/dictionary.js';
import { BertTokenizer } from 'bert-tokenizer';

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
    MODEL_PATH_DISTILBERT = path.resolve(__dirname, '../spam-detector-js/model.json');

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

      async executeDistilBert(inputText) {
        try {
            const vocabUrl = 'node_modules/bert-tokenizer/assets/vocab.json'
            const tokenizer = new BertTokenizer(vocabUrl);
            const tokens = tokenizer.convertSingleExample(inputText);
            let input_ids = tokens.inputIds;
            let attention_mask = tokens.inputMask;
            const tensor1 = tf.tensor([input_ids], [1, 128], 'int32');
            const tensor2 = tf.tensor([attention_mask], [1, 128], 'int32');
            const model = await tf.loadGraphModel(`file://${this.MODEL_PATH_DISTILBERT}`);
            const result = await model.predictAsync({input_ids: tensor1, attention_mask: tensor2});
            const predictedClassId = result.argMax(-1).dataSync()[0];
            if (predictedClassId === 1) {
                return true;
            }
            return false;
        } catch (err) {
            console.log(err);
        }
      }
}

