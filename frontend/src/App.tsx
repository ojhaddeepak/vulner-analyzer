import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { FileResultPage } from './pages/FileResultPage'
import { UrlResultPage } from './pages/UrlResultPage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { AuthCallbackPage } from './pages/AuthCallbackPage'

function App() {
  return (
    <>
      <Routes>
        {/* Auth routes without layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        
        {/* Main app routes with layout */}
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/file/:id" element={<FileResultPage />} />
              <Route path="/url/:id" element={<UrlResultPage />} />
            </Routes>
          </Layout>
        } />
      </Routes>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </>
  )
}

export default App
