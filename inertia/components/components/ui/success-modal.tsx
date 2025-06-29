import React from 'react'
import { Button } from './button'
import { CheckCircle } from 'lucide-react'

interface SuccessModalProps {
    open: boolean
    onClose: () => void
    title?: string
    message?: string
    buttonText?: string
}

export default function SuccessModal({
    open,
    onClose,
    title = 'Sucesso!',
    message = 'Operação realizada com sucesso.',
    buttonText = 'OK'
}: SuccessModalProps) {
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
                    onClick={onClose}
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

                <div style={{ marginBottom: 16 }}>
                    <CheckCircle
                        size={48}
                        style={{ color: '#10b981' }}
                    />
                </div>

                <div style={{
                    fontSize: 18,
                    fontWeight: 500,
                    marginBottom: 8,
                    color: '#10b981'
                }}>
                    {title}
                </div>

                <div style={{
                    color: '#666',
                    fontSize: 14,
                    marginBottom: 24
                }}>
                    {message}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                        onClick={onClose}
                        style={{
                            padding: '8px 24px',
                            borderRadius: 6,
                            border: 'none',
                            background: '#10b981',
                            color: '#fff',
                            fontWeight: 500,
                            cursor: 'pointer',
                            minWidth: 100,
                        }}
                        variant="default"
                    >
                        {buttonText}
                    </Button>
                </div>
            </div>
        </div>
    )
} 