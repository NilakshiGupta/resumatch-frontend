// Pehle imports mein Layout add karo
import Layout from './components/Layout'

function App() {
    return (
        <BrowserRouter>
            <ScrollReset />
            <Layout> {/* Sab kuch iske andar wrap kar do */}
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    {/* ... baaki saare routes ... */}
                </Routes>
            </Layout>
        </BrowserRouter>
    )
}