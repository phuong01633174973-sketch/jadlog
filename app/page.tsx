"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { getWhatsAppCode, checkInstanceStatus } from "./actions"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Copy, RefreshCw, Smartphone, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Header from "./components/header"
import Banner from "./components/banner"
import Footer from "./components/footer"
import ConnectionModal from "./components/connection-modal"

export default function Home() {
  const [code, setCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPhoneForm, setShowPhoneForm] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [copied, setCopied] = useState(false)
  const [phone, setPhone] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)

  useEffect(() => {
    if (!code || isConnected) return

    let intervalId: NodeJS.Timeout
    let checkCount = 0
    const maxChecks = 30 

    const checkConnectionStatus = async () => {
      if (isCheckingStatus) return

      setIsCheckingStatus(true)
      try {
        const result = await checkInstanceStatus()

        if (result.success && result.connected) {
          setIsConnected(true)
          setShowModal(true)
          clearInterval(intervalId)
        }

        checkCount++
        if (checkCount >= maxChecks) {
          clearInterval(intervalId)
        }
      } catch (error) {
        console.error("Erro ao verificar status:", error)
      } finally {
        setIsCheckingStatus(false)
      }
    }

    checkConnectionStatus()
    intervalId = setInterval(checkConnectionStatus, 10000)

    return () => {
      clearInterval(intervalId)
    }
  }, [code, isConnected, isCheckingStatus])

  const handleInitialClick = () => {
    setShowPhoneForm(true)
  }

  const fetchCode = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!phone || phone.length < 10) {
      setError("Por favor, insira um número de telefone válido com DDD")
      return
    }

    setIsLoading(true)
    setError(null)
    setShowTutorial(true)

    try {
      const formData = new FormData()
      formData.append("phone", phone)

      const response = await getWhatsAppCode(formData)

      if (response.success && response.code) {
        setCode(response.code)
        setIsConnected(false) 
      } else {
        setError(response.error || "Erro ao obter o código")
      }
    } catch (err) {
      setError("Falha ao comunicar com o servidor")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    if (!phone || phone.length < 10) {
      setError("Número de telefone inválido. Não é possível gerar um novo código.")
      return
    }

    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("phone", phone)

    getWhatsAppCode(formData)
      .then((response) => {
        if (response.success && response.code) {
          setCode(response.code)
          setIsConnected(false) 
        } else {
          setError(response.error || "Erro ao obter o código")
        }
      })
      .catch((err) => {
        console.error("Erro ao gerar novo código:", err)
        setError("Falha ao comunicar com o servidor")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleBack = () => {
    if (showTutorial) {
      setShowTutorial(false)
    } else if (showPhoneForm) {
      setShowPhoneForm(false)
    }
  }

  const closeModal = () => {
    setShowModal(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <Banner />

      <ConnectionModal isOpen={showModal} onClose={closeModal} />

      <main className="flex-grow flex flex-col items-center justify-center p-4 py-12">
        <div className="max-w-md w-full mx-auto text-center">
          {!showPhoneForm && !showTutorial ? (
            <div className="space-y-8">
              <div className="space-y-4">
                <Smartphone className="h-16 w-16 mx-auto text-[#ff0030]" />
                <h1 className="text-3xl font-bold text-gray-800">Conecte seu WhatsApp para trabalhar conosco</h1>
                <p className="text-gray-600 max-w-sm mx-auto">
                  Obtenha o código de conexão e siga o tutorial para conectar seu WhatsApp.
                </p>
              </div>

              <Button
                onClick={handleInitialClick}
                className="bg-[#ff0030] hover:bg-[#cc0026] text-white px-8 py-6 text-lg rounded-lg"
              >
                Conectar WhatsApp
              </Button>
            </div>
          ) : showPhoneForm && !showTutorial ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Informe seu número de telefone</h2>

              <form onSubmit={fetchCode} className="space-y-6">
                <div className="space-y-2 text-left">
                  <Label htmlFor="phone">Número de WhatsApp com DDD</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500 text-lg">+55</span>
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="11999999999"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-12 text-center text-lg py-6"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">Digite apenas números, incluindo o DDD (sem o +55)</p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="bg-[#ff0030] hover:bg-[#cc0026] text-white w-full py-6 text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Processando..." : "Obter Código"}
                  </Button>
                </div>
              </form>

              <Button onClick={handleBack} variant="outline" className="text-[#ff0030] border-[#ff0030]">
                Voltar
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Conecte seu WhatsApp</h2>

              <div className="bg-white p-6 rounded-xl border shadow-md">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff0030]"></div>
                  </div>
                ) : error ? (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : code ? (
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <h3 className="font-semibold text-lg text-gray-800 mb-2">Seu código de conexão:</h3>
                      <div className="flex items-center justify-between bg-white p-3 rounded border">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-5 w-5 text-[#ff0030]" />
                          <span className="text-xl font-mono font-bold">{code}</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleCopy} className="flex items-center gap-1">
                          {copied ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              <span>Copiar</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertTitle className="text-blue-800">Importante</AlertTitle>
                      <AlertDescription className="text-blue-700">
                        Não feche esta página até que apareça a mensagem de confirmação "WhatsApp Conectado!".
                      </AlertDescription>
                    </Alert>

                    <div className="text-left space-y-4">
                      <h3 className="font-semibold text-lg text-gray-800">Como conectar:</h3>

                      <ol className="list-decimal list-inside space-y-3 text-gray-700">
                        <li>Abra o WhatsApp no seu celular</li>
                        <li>
                          Toque em <strong>Menu</strong> (três pontos) ou <strong>Configurações</strong>
                        </li>
                        <li>
                          Selecione <strong>Aparelhos conectados</strong>
                        </li>
                        <li>
                          Toque em <strong>Conectar um aparelho</strong>
                        </li>
                        <li>
                          Toque em <strong>Conectar com número de telefone</strong> na parte inferior da tela
                        </li>
                        <li>
                          Digite o código <strong>{code}</strong> mostrado acima
                        </li>
                        <li>Aguarde a confirmação da conexão</li>
                      </ol>

                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-4">
                        <p className="text-sm text-blue-800">
                          <strong>Dica:</strong> Mantenha esta página aberta até concluir a conexão. O código expira
                          após alguns minutos.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <p>Nenhum código disponível</p>
                  </div>
                )}

                {!isLoading && code && !isConnected && (
                  <div className="flex justify-center mt-6">
                    <Button
                      onClick={handleRefresh}
                      className="flex items-center gap-2 bg-[#ff0030] hover:bg-[#cc0026] text-white"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Gerar novo código
                    </Button>
                  </div>
                )}
              </div>

              <Button onClick={handleBack} variant="outline" className="text-[#ff0030] border-[#ff0030]">
                Voltar
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
