import { useState, useRef, useEffect } from 'react';
import {
  Shield,
  Check,
  Package,
  Terminal,
  Upload,
  Play,
  FileText,
  Clock,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const pulse = {
  animate: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const AndroidSecurityDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const logsEndRef = useRef(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prevLogs => [...prevLogs, { message, timestamp, type }]);
  };

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 50);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    addLog(`Selected file: ${file.name}`, 'info');
  };

  const uploadFile = async () => {
    const formData = new FormData();
    formData.append('apk_file', selectedFile);

    addLog('Initializing upload process...', 'info');
    addLog('Checking file integrity...', 'info');
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);
    addLog('File uploaded successfully ✨', 'success');
    return response.json();
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      addLog('No file selected!', 'error');
      return;
    }

    const maxSize = 500 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      addLog('File size exceeds 500MB limit!', 'error');
      return;
    }

    setIsAnalyzing(true);
    setLogs([]);
    simulateProgress();

    const analysisSteps = [
      'Initializing analysis environment...',
      'Decompiling APK...',
      'Scanning manifest file...',
      'Analyzing permissions...',
      'Checking security configurations...',
      'Identifying potential vulnerabilities...',
      'Generating security recommendations...'
    ];

    try {
      for (const step of analysisSteps) {
        addLog(step, 'info');
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      await uploadFile();
      addLog('Starting deep analysis...', 'info');

      const analysisResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: selectedFile.name }),
      });

      if (!analysisResponse.ok) {
        throw new Error('Analysis failed');
      }

      const result = await analysisResponse.json();

      if (result.error) {
        throw new Error(result.error);
      }

      addLog(`Found ${result.permissions.length} permissions 🔍`, 'success');
      addLog(`Generated ${result.mitigations.length} security recommendations 🛡️`, 'success');
      addLog('Analysis completed successfully! 🎉', 'success');

      setAnalysisResult({
        appName: result.analysis.app_name,
        packageName: result.analysis.package_name,
        permissions: result.permissions,
        mitigations: result.mitigations
      });
    } catch (error) {
      addLog(`Error: ${error.message}`, 'error');
    } finally {
      setIsAnalyzing(false);
      setProgress(100);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <motion.div
        className="max-w-7xl mx-auto space-y-6"
        initial="initial"
        animate="animate"
      >
        {/* Enhanced Header with Hover Effects */}
        <motion.div
          variants={fadeInUp}
          className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-8 rounded-2xl shadow-xl border border-gray-200"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-transparent opacity-30"
            animate={{
              x: ['0%', '100%', '0%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              <Shield className="w-12 h-12 text-indigo-600 mr-4" />
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent tracking-wide">
                Android App Security Analysis
              </h1>
            </motion.div>

            <div className="flex flex-wrap items-center gap-4">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.08, rotate: 1 }}
                whileTap={{ scale: 0.95 }}
              >
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="apk-file"
                  accept=".apk"
                />
                <label
                  htmlFor="apk-file"
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-100 via-blue-100 to-indigo-50 text-indigo-700 rounded-lg cursor-pointer hover:bg-gradient-to-r hover:from-indigo-200 hover:to-blue-200 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  {selectedFile ? selectedFile.name : 'Select APK'}
                </label>
              </motion.div>

              <motion.button
                onClick={handleAnalyze}
                disabled={!selectedFile || isAnalyzing}
                whileHover={{ scale: 1.1, rotate: 1 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center px-6 py-3 rounded-lg text-white shadow-xl transition-all duration-300 ${isAnalyzing || !selectedFile
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-blue-500 hover:from-blue-700 hover:to-purple-700'
                  }`}
              >
                {isAnalyzing ? (
                  <Clock className="w-5 h-5 mr-2 animate-spin text-white" />
                ) : (
                  <Play className="w-5 h-5 mr-2 text-white" />
                )}
                {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
              </motion.button>
            </div>
          </div>
        </motion.div>


        {/* Animated Progress Bar */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              variants={fadeInUp}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
            >
              <motion.div
                className="w-full bg-gray-100 rounded-full h-3 overflow-hidden"
                variants={pulse}
              >
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              </motion.div>
              <motion.p
                className="text-center mt-3 text-sm text-gray-600 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {progress}% Complete
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enhanced Terminal Logs Panel */}
          <motion.div
            variants={fadeInUp}
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 lg:col-span-2"
          >
            <div className="flex items-center mb-4">
              <Terminal className="w-6 h-6 text-blue-500 mr-2" />
              <h2 className="text-xl font-bold text-gray-800">Analysis Logs</h2>
            </div>
            <motion.div
              className="bg-gray-900 rounded-lg p-4 h-72 overflow-y-auto font-mono"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <AnimatePresence>
                {logs.map((log, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-start space-x-2 mb-2 ${log.type === 'error' ? 'text-red-400' :
                      log.type === 'success' ? 'text-green-400' :
                        'text-blue-400'
                      }`}
                  >
                    <span className="text-gray-500 text-xs font-semibold">{log.timestamp}</span>
                    <ChevronRight className="w-4 h-4 mt-1" />
                    <span className="flex-1">{log.message}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={logsEndRef} />
            </motion.div>
          </motion.div>
          {/* Image beside Analysis Logs */}
          <motion.img
            src='/public/1.png'
            alt="Analysis Illustration"
            // className="hidden lg:block w-1/3 h-auto rounded-xl shadow-lg"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: [0, -10, 0] }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "mirror"
            }}
            whileHover={{ scale: 1.05 }}
          />


          {/* Analysis Results with Enhanced Animations */}
          <AnimatePresence>
            {analysisResult && (
              <motion.div
                layout
                className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8"
                variants={fadeInUp}
              >
                {/* App Info Panel */}
                <motion.div
                  className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center mb-6">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Package className="w-6 h-6 text-blue-600 mr-2" />
                    </motion.div>
                    <h2 className="text-xl font-bold text-gray-800">App Information</h2>
                  </div>
                  <div className="space-y-4">
                    <motion.div
                      className="p-4 bg-gradient-to-r from-blue-50 to-white rounded-lg shadow-sm"
                      whileHover={{ scale: 1.03, backgroundColor: '#E0F2FE' }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="font-semibold text-gray-700 mb-2">App Name</h3>
                      <p className="text-gray-600">{analysisResult?.appName}</p>
                    </motion.div>
                    <motion.div
                      className="p-4 bg-gradient-to-r from-blue-50 to-white rounded-lg shadow-sm"
                      whileHover={{ scale: 1.03, backgroundColor: '#E0F2FE' }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="font-semibold text-gray-700 mb-2">Package Name</h3>
                      <p className="text-gray-600">{analysisResult?.packageName}</p>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Permissions Panel */}
                <motion.div
                  className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center mb-6">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Shield className="w-6 h-6 text-green-600 mr-2" />
                    </motion.div>
                    <h2 className="text-xl font-bold text-gray-800">Required Permissions</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-3 max-h-72 overflow-y-auto pr-2">
                    {analysisResult?.permissions.map((permission, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.03, backgroundColor: '#E8F5E9' }}
                        className="bg-green-50 p-4 rounded-lg text-sm border border-green-100 transition-all duration-300 shadow-sm"
                      >
                        {permission}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Security Mitigations Panel */}
                <motion.div
                  className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 md:col-span-2"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center mb-6">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <AlertTriangle className="w-6 h-6 text-yellow-500 mr-2" />
                    </motion.div>
                    <h2 className="text-xl font-bold text-gray-800">Security Mitigations</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisResult?.mitigations.map((mitigation, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.03, backgroundColor: '#FFF3E0' }}
                        className="bg-yellow-50 p-4 rounded-lg text-sm border border-yellow-100 transition-all duration-300 shadow-sm"
                      >
                        {mitigation}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </div>
  );
}


export default AndroidSecurityDashboard;