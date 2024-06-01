// src/Popup.tsx
import React, { useState } from 'react';
import axios from 'axios';

import './Popup.css';

interface AnalysisAttributes {
  [key: string]: {
    summaryScore: {
      value: number;
    };
  };
}

function Popup() {
  const [insights, setInsights] = useState<string>('');
  const [analysis, setAnalysis] = useState<string>('');

  const handleReadText = () => {
    console.log('handleReadText called');

    // Verify chrome exists
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ type: 'GET_TEXT' }, (response) => {
        console.log('Response from background script:', response);

        // If content is loaded, perform AI analysis
        if (response && response.text) {
          const pageText = response.text as string;
          console.log('Page Text:', pageText);
          const insights = analyzeText(pageText);
          setInsights(insights);
          analyzeWithAI(pageText).then((analysis) => {
            setAnalysis(analysis.text);
            if (analysis.shouldReport) {
              // Prompt user to report
              window.alert('The text contains potentially harmful content. You should consider reporting it.');
            } else {
                window.alert('Everything is okay here. Minimal threat level.');
            }
          });
        }
      });
    } else {
      setInsights('Chrome API is not available.');
    }
  };

  // Obtain word count from page inner text
  const analyzeText = (text: string): string => {
    const wordCount = text.split(/\s+/).length;
    return `Word Count: ${wordCount}`;
  };

  // Analyze text by sending page inner text to Perspective API for analytics 
  const analyzeWithAI = async (text: string): Promise<{ text: string, shouldReport: boolean }> => {
    try {
      const response = await axios.post(
        'https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=AIzaSyAr2zqfWrSGfO5GOfhX_EvzP8op-VIPF_8',
        {
          comment: { text: text },
          languages: ['en'],
          requestedAttributes: {
            TOXICITY: {},
            SEVERE_TOXICITY: {},
            INSULT: {},
            PROFANITY: {},
            IDENTITY_ATTACK: {},
            THREAT: {},
          },
        }
      );

      const attributes: AnalysisAttributes = response.data.attributeScores;
      let analysisResult = '';
      let shouldReport = false;

      // Assess analysis scores and assess whether the user must report or not
      for (const [key, value] of Object.entries(attributes)) {
        analysisResult += `${key}: ${value.summaryScore.value.toFixed(2)}\n`;
        if (['TOXICITY', 'INSULT', 'THREAT', 'PROFANITY'].includes(key) && value.summaryScore.value >= 0.3) {
          shouldReport = true;
        }
      }

      return { text: analysisResult, shouldReport: shouldReport };
    } catch (error) {
      console.error('Error analyzing text with AI:', error);
      return { text: 'Error analyzing text with AI.', shouldReport: false };
    }
  };

  return (
    <div>
      <h1 className='title'>SafeSpace</h1>
      <p className='tag-line'>Making the web a safer space</p>
      <button className='analyze-button' onClick={handleReadText}>Analyze Text</button>
      <div>
        <h2 className='sub-title'>Insights</h2>
        <pre className='insight-section'>{insights}</pre>
        <h2 className='sub-title'>AI Analysis</h2>
        <pre className='insight-section'>{analysis}</pre>
      </div>
    </div>
  );
}

function getTextFromPage(): string {
  return document.body.innerText;
}

export default Popup;
