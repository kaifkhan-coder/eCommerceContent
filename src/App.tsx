import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Copy, Check, ShoppingBag, Type, Hash, AlignLeft, AlertCircle, Image as ImageIcon, UploadCloud, X } from 'lucide-react';
import { ContentMode, generateContent } from './lib/gemini';

export default function App() {
  const [mode, setMode] = useState<ContentMode>('description');
  const [productName, setProductName] = useState('');
  const [features, setFeatures] = useState('');
  const [audience, setAudience] = useState('');
  const [mrp, setMrp] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [image, setImage] = useState<{ url: string; file: File; base64Data: string; mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (mode === 'image-analysis') {
      if (!image) {
        setError('Please upload an image to analyze.');
        return;
      }
    } else {
      if (!productName.trim() || !features.trim()) {
        setError('Product Name and Features are required.');
        return;
      }
    }
    
    setError('');
    setResult('');
    setIsGenerating(true);
    setCopied(false);
    
    try {
      const imageData = image ? { mimeType: image.mimeType, data: image.base64Data } : undefined;
      const output = await generateContent(mode, productName, features, audience, mrp, sellingPrice, imageData);
      setResult(output);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
       setError('Please upload a valid image file.');
       return;
    }

    const url = URL.createObjectURL(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      setImage({
        url,
        file,
        base64Data,
        mimeType: file.type
      });
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modes = [
    { id: 'description', label: 'Description', icon: AlignLeft },
    { id: 'ad', label: 'Ad Copy', icon: Hash },
    { id: 'title', label: 'Title Optimizer', icon: Type },
    { id: 'image-analysis', label: 'Image Analyzer', icon: ImageIcon },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 flex flex-col relative overflow-x-hidden">
      {/* Background Atmospheric Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[150px] pointer-events-none z-0"></div>

      {/* Header */}
      <header className="h-16 border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-md relative z-10 w-full flex items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              eCommerce Content AI
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Input Section */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm space-y-6">
              
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-4">What are you creating?</h2>
                <div className="grid grid-cols-2 lg:grid-cols-2 gap-2">
                  {modes.map((m) => {
                    const Icon = m.icon;
                    const isActive = mode === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setMode(m.id as ContentMode)}
                        className={`flex items-center justify-start gap-2 px-3 py-2.5 text-xs rounded-md font-medium transition-all ${
                          isActive 
                            ? 'bg-indigo-600/20 border border-indigo-500/50 text-indigo-300' 
                            : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-5">
                {mode === 'image-analysis' ? (
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">
                      PRODUCT IMAGE <span className="text-indigo-400">*</span>
                    </label>
                    
                    {!image ? (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/50 hover:bg-slate-900"
                      >
                        <UploadCloud className="w-8 h-8 text-slate-500 mb-3" />
                        <p className="text-sm text-slate-400 text-center">
                          Click to upload an image<br/>
                          <span className="text-xs text-slate-600">JPG, PNG, WebP</span>
                        </p>
                      </div>
                    ) : (
                      <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
                        <img src={image.url} alt="Uploaded product" className="w-full max-h-48 object-contain" />
                        <button 
                          onClick={() => {
                            setImage(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-red-500 text-white rounded-full transition-colors backdrop-blur-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                ) : null}

                <div>
                  <label htmlFor="productName" className="block text-xs font-medium text-slate-400 mb-2">
                    PRODUCT NAME {mode !== 'image-analysis' && <span className="text-indigo-400">*</span>}
                  </label>
                  <input
                    id="productName"
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Pro Wireless Earbuds"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600 text-slate-200"
                  />
                </div>

                <div>
                  <label htmlFor="features" className="block text-xs font-medium text-slate-400 mb-2">
                    KEY FEATURES / BENEFITS {mode !== 'image-analysis' && <span className="text-indigo-400">*</span>}
                  </label>
                  <textarea
                    id="features"
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                    rows={5}
                    placeholder="e.g. Active Noise Cancellation&#10;40-hour battery life&#10;Waterproof design"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600 text-slate-200 resize-none"
                  />
                </div>

                <div>
                  <label htmlFor="audience" className="block text-xs font-medium text-slate-400 mb-2">
                    TARGET AUDIENCE <span className="text-slate-600 font-normal">(Optional)</span>
                  </label>
                  <input
                    id="audience"
                    type="text"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="e.g. Commuters, fitness enthusiasts"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600 text-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="mrp" className="block text-xs font-medium text-slate-400 mb-2">
                      MRP <span className="text-slate-600 font-normal">(Optional)</span>
                    </label>
                    <input
                      id="mrp"
                      type="text"
                      value={mrp}
                      onChange={(e) => setMrp(e.target.value)}
                      placeholder="e.g. $99"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600 text-slate-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="sellingPrice" className="block text-xs font-medium text-slate-400 mb-2">
                      SELLING PRICE <span className="text-slate-600 font-normal">(Optional)</span>
                    </label>
                    <input
                      id="sellingPrice"
                      type="text"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                      placeholder="e.g. $79"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600 text-slate-200"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || (mode === 'image-analysis' ? !image : (!productName.trim() || !features.trim()))}
                className="w-full py-4 mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed group"
              >
                {isGenerating ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <Sparkles className="w-4 h-4 group-disabled:opacity-50" />
                )}
                {isGenerating ? 'GENERATING...' : 'GENERATE CONTENT'}
              </button>
              
              {error && (
                <div className="flex items-center gap-2 text-red-400 bg-red-900/10 p-3 rounded-xl text-sm border border-red-500/20">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Output Section */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col relative overflow-hidden min-h-[500px]">
              
              <div className="h-12 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-950/20">
                <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                  Generated Result
                </span>
                
                {result && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 hover:border-slate-600"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'COPIED!' : 'COPY TEXT'}
                  </button>
                )}
              </div>

              <div className="flex-1 p-6 sm:p-8 overflow-y-auto leading-relaxed relative">
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center text-slate-400"
                    >
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        className="mb-4 text-indigo-500"
                      >
                        <Sparkles className="w-10 h-10 mx-auto opacity-50 drop-shadow-lg shadow-indigo-500" />
                      </motion.div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 animate-pulse">Crafting the perfect words...</p>
                    </motion.div>
                  ) : result ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-slate-300 whitespace-pre-wrap leading-relaxed max-w-2xl mx-auto space-y-6 text-sm sm:text-base"
                    >
                      {result}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex flex-col items-center justify-center text-slate-500"
                    >
                      <Type className="w-10 h-10 mb-4 opacity-20" />
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 text-center max-w-[250px] leading-relaxed">
                        Fill in your product details and hit generate to see the AI in action.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
