import React, { useState } from 'react';
import { Bot, Sparkles, AlertTriangle, HeartHandshake, ArrowRight } from 'lucide-react';

import { getAiRecommendationsApi } from '../utils/api.js';
import ProductCard from '../components/products/ProductCard.jsx';
import Button from '../components/ui/Button.jsx';

const AIRecommendations = () => {
  const [symptomInput, setSymptomInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [analyzed, setAnalyzed] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiDisclaimer, setAiDisclaimer] = useState('');
  const [isFallback, setIsFallback] = useState(false);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!symptomInput.trim()) return;

    setIsAnalyzing(true);
    setAnalyzed(false);

    try {
      const response = await getAiRecommendationsApi(symptomInput);
      setRecommendations(response.recommendations || []);
      setAiAnalysis(response.analysis || '');
      setAiDisclaimer(response.disclaimer || '');
      setIsFallback(!!response.isFallback);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setIsAnalyzing(false);
      setAnalyzed(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      {/* Header Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-primary-100 dark:border-primary-950/20 bg-linear-to-r from-primary-50/20 via-transparent to-transparent flex flex-col md:flex-row items-center gap-6 mb-10">
        <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white shadow-lg shadow-primary-500/25 shrink-0">
          <Bot size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold font-display text-txt-title flex items-center gap-2">
            AI Medicine Recommendation Guide
            <Sparkles className="text-primary-500" size={20} />
          </h1>
          <p className="text-sm text-txt-muted mt-1 max-w-2xl">
            Input your current physical symptoms (e.g. headache, fever, running nose) to search our certified product catalog for appropriate over-the-counter and prescription guides.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Symptom Form Input */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="font-display font-bold text-base text-txt-title">
            Describe Your Symptoms
          </h3>
          <form onSubmit={handleAnalyze} className="space-y-4">
            <textarea
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
              rows="5"
              placeholder="e.g. I have a severe headache, mild fever, and a blocked nose since yesterday."
              required
              className="form-input text-sm resize-none"
            />
            <Button
              type="submit"
              variant="primary"
              className="w-full gap-2"
              isLoading={isAnalyzing}
            >
              Analyze Symptoms
              <ArrowRight size={16} />
            </Button>
          </form>

          {/* Quick links to click and try */}
          <div className="pt-2">
            <p className="text-[10px] font-bold text-dark-400 uppercase tracking-wider mb-2">
              Try keyword queries:
            </p>
            <div className="flex flex-wrap gap-2">
              {['pain', 'migraine', 'allergy', 'cough', 'multivitamin'].map((term) => (
                <button
                  key={term}
                  onClick={() => setSymptomInput(`I need something for ${term}`)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-bdr-light/40 hover:bg-primary-50 hover:text-primary-500 border border-bdr-main text-txt-muted cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Inference Output Pane */}
        <div className="lg:col-span-2 space-y-6">
          {/* Medical Caveat Warning */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-600 flex items-start gap-3 text-xs leading-relaxed">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <div className="text-left font-sans">
              <p className="font-bold font-display">Clinical Safety Disclaimer:</p>
              <p className="mt-0.5">
                {aiDisclaimer || "CuraCare AI recommendations are simulated search matches and do NOT constitute professional medical advice, prescription guidelines, or diagnosis. Always consult with a doctor before consuming prescription (Rx) drugs. In case of medical emergencies, visit your nearest emergency room immediately."}
              </p>
            </div>
          </div>

          {/* Demo Fallback Alert Box */}
          {isFallback && (
            <div className="p-3.5 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-600 text-xs text-left">
              💡 <strong>Demo Mode Heuristic:</strong> Configure <code>GEMINI_API_KEY</code> in the backend <code>.env</code> file to enable actual generative AI analysis and recommendation reasoning.
            </div>
          )}

          {/* Results Area */}
          {isAnalyzing ? (
            <div className="glass-panel rounded-3xl p-16 text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-primary-100 border-t-primary-500 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-txt-title font-display">
                CuraCare AI Bot is generating clinical matching criteria...
              </p>
            </div>
          ) : analyzed ? (
            <div className="space-y-6">
              {aiAnalysis && (
                <div className="glass-panel p-5 rounded-2xl text-left border border-dark-100 dark:border-dark-850">
                  <h4 className="font-display font-bold text-xs text-primary-500 uppercase tracking-wider mb-2">
                    AI Clinical Analysis & Recommendation
                  </h4>
                  <p className="text-xs text-txt-main leading-relaxed font-sans">{aiAnalysis}</p>
                </div>
              )}

              <div>
                <h3 className="font-display font-bold text-lg text-txt-title mb-6">
                  Recommended Medications ({recommendations.length})
                </h3>
                {recommendations.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {recommendations.map((rec) => (
                      <div key={rec.product._id} className="glass-panel p-4 rounded-2xl border border-dark-100 dark:border-dark-850 flex flex-col justify-between space-y-3">
                        <ProductCard product={rec.product} />
                        <div className="text-[11px] text-primary-600 dark:text-primary-400 bg-primary-500/5 dark:bg-primary-500/10 p-3 rounded-xl border border-primary-500/10 font-sans italic text-left">
                          <strong>AI Reason:</strong> {rec.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-panel rounded-3xl py-12 px-4 text-center">
                    <div className="w-14 h-14 rounded-full bg-bdr-light/40 text-dark-450 flex items-center justify-center mx-auto mb-4">
                      <HeartHandshake size={24} />
                    </div>
                    <h4 className="font-display font-bold text-sm text-txt-title mb-2">
                      No Direct Matching Medications Found
                    </h4>
                    <p className="text-xs text-txt-muted max-w-sm mx-auto">
                      Our database didn't match those specific terms. Please check your spelling or describe simple general symptoms (e.g. pain, allergy, vitamins).
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl py-20 px-4 text-center border border-dashed border-bdr-main">
              <Bot size={44} className="text-dark-300 mx-auto mb-4" />
              <h4 className="font-display font-bold text-txt-main text-sm mb-1">
                Awaiting Symptom Input
              </h4>
              <p className="text-xs text-dark-400 max-w-xs mx-auto">
                Describe how you feel in the input panel to trigger search suggestions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIRecommendations;
