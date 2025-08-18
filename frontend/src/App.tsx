import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { FileResultPage } from './pages/FileResultPage'
import { UrlResultPage } from './pages/UrlResultPage'

function App() {
  return (
    <>
      <Routes>
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
