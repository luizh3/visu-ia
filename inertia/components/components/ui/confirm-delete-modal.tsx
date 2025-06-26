import React from 'react'
import { Button } from './button'

interface ConfirmDeleteModalProps {
    open: boolean
    onCancel: () => void
    onConfirm: () => void
    message?: string
    description?: string
}

export default function ConfirmDeleteModal({
    open,
    onCancel,
    onConfirm,
    message = 'Tem certeza que deseja deletar este item?',
    description = 'Se você deletar, não será possível recuperar.',
}: ConfirmDeleteModalProps) {
    if (!open) return null

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.15)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <div style={{
                background: '#fff',
                borderRadius: 10,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                padding: 32,
                minWidth: 340,
                maxWidth: '90vw',
                position: 'relative',
                textAlign: 'center',
            }}>
                <Button
                    onClick={onCancel}
                    style={{
                        position: 'absolute',
                        top: 12,
                        right: 16,
                        background: 'none',
                        border: 'none',
                        fontSize: 20,
                        color: '#888',
                        cursor: 'pointer',
                        minWidth: 0,
                        width: 32,
                        height: 32,
                        padding: 0,
                        lineHeight: 1,
                    }}
                    aria-label="Fechar"
                    variant="ghost"
                >
                    ×
                </Button>
                <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>{message}</div>
                <div style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>{description}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                    <Button
                        onClick={onCancel}
                        style={{
                            padding: '8px 20px',
                            borderRadius: 4,
                            border: '1px solid #ddd',
                            background: '#fff',
                            color: '#333',
                            fontWeight: 500,
                            cursor: 'pointer',
                        }}
                        variant="outline"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={onConfirm}
                        style={{
                            padding: '8px 20px',
                            borderRadius: 4,
                            border: 'none',
                            background: '#e74c3c',
                            color: '#fff',
                            fontWeight: 500,
                            cursor: 'pointer',
                        }}
                        variant="destructive"
                    >
                        Deletar
                    </Button>
                </div>
            </div>
        </div>
    )
} 