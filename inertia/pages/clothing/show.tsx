import { useState } from 'react'
import { Button } from '../../components/components/ui/button'
import Navbar from '../../components/components/ui/navbar'
import { useCsrf } from '../../hooks/use-csrf'
import type { Clothing } from '../../types/clothing'
import ConfirmDeleteModal from '../../components/components/ui/confirm-delete-modal'

const defaultImage = '/defaults/clothing.png'

type Props = {
    clothing: Clothing
}

export default function ClothingShow({ clothing }: Props) {
    const { fetchWithCsrf } = useCsrf()
    const [modalOpen, setModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        setLoading(true)
        try {
            const response = await fetchWithCsrf(`/clothing/${clothing.id}`, {
                method: 'DELETE'
            })
            if (response.ok || response.status === 302) {
                window.location.href = '/clothing'
            } else {
                try {
                    const errorData = await response.json()
                    alert(`Erro ao deletar: ${errorData.message || 'Erro desconhecido'}`)
                } catch {
                    alert('Erro ao deletar a roupa. Tente novamente.')
                }
            }
        } catch (error) {
            console.error('Erro ao deletar:', error)
            alert('Erro ao deletar a roupa. Tente novamente.')
        } finally {
            setLoading(false)
            setModalOpen(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto py-10 px-4">
                <Navbar />
                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
                    <img
                        src={clothing.image || defaultImage}
                        alt={clothing.name}
                        className="w-64 h-80 object-cover rounded-lg mb-6 border"
                    />
                    <h1 className="text-3xl font-bold mb-2 text-center">{clothing.name}</h1>
                    <div className="flex gap-4 mb-4 text-lg font-medium text-gray-600 justify-center">
                        <span className="bg-gray-100 rounded px-3 py-1">{clothing.type}</span>
                        <span className="bg-gray-100 rounded px-3 py-1">{clothing.color}</span>
                        <span className="bg-gray-100 rounded px-3 py-1">{clothing.size}</span>
                    </div>
                    <div className="w-full mb-6">
                        <h2 className="text-lg font-semibold mb-1">Descrição</h2>
                        <p className="text-gray-700 bg-gray-50 rounded p-3 min-h-[60px]">{clothing.description || 'Sem descrição.'}</p>
                    </div>
                    <div className="flex gap-4 w-full justify-between mt-4">
                        <Button variant="outline" onClick={() => window.location.href = '/'}>Voltar</Button>
                        <Button
                            onClick={() => setModalOpen(true)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={loading}
                        >
                            Deletar
                        </Button>
                    </div>
                </div>
            </div>
            <ConfirmDeleteModal
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                onConfirm={handleDelete}
            />
        </div>
    )
} 