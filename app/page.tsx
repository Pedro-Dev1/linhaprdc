"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, Edit, Trash2, Plus, FileDown } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import * as XLSX from 'xlsx'

interface Tecnico {
  id: number
  nome: string
  login: string
  senha: string
  isMaster: boolean
}

interface Etapa {
  nome: string
  concluida: boolean
  dataInicio?: string
  dataConcluidaEm?: string
  tecnicoResponsavel?: string
  tempoGasto?: number
  tempoInicio?: number
}

interface Maquina {
  id: number
  modelo: string
  serial: string
  fabricante: string
  status: string
  dataCadastro: string
  etapas: Etapa[]
  nomeCliente: string
  numeroBox: string
  patrimonio: string
  dataFinalizacao?: string
  editType?: string  // Make sure this property exists
}

interface LoginComponentProps {
  isLoggedIn: boolean
  tecnicoLogado: Tecnico | null
  loginHandler: (login: string, senha: string) => void
  logoutHandler: () => void
}

const LoginComponent: React.FC<LoginComponentProps> = ({ isLoggedIn, tecnicoLogado, loginHandler, logoutHandler }) => {
  const [loginTecnico, setLoginTecnico] = useState('')
  const [senhaTecnico, setSenhaTecnico] = useState('')

  const handleLogin = () => {
    loginHandler(loginTecnico, senhaTecnico)
    setLoginTecnico('')
    setSenhaTecnico('')
  }

  return (
    <div className="mb-4 p-4 bg-gray-100 rounded-lg">
      {!isLoggedIn ? (
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Login"
            value={loginTecnico}
            onChange={(e) => setLoginTecnico(e.target.value)}
            className="w-32"
          />
          <Input
            type="password"
            placeholder="Senha"
            value={senhaTecnico}
            onChange={(e) => setSenhaTecnico(e.target.value)}
            className="w-32"
          />
          <Button onClick={handleLogin}>Entrar</Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p>Usuário logado: {tecnicoLogado?.nome}</p>
          <Button onClick={logoutHandler}>Sair</Button>
        </div>
      )}
    </div>
  )
}

export default function PainelCompleto() {
  const [currentTab, setCurrentTab] = useState('abastecimento')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isMasterLoggedIn, setIsMasterLoggedIn] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [tecnicoLogado, setTecnicoLogado] = useState<Tecnico | null>(null)

  const [maquinas, setMaquinas] = useState<Maquina[]>([])
  const [maquinasProducao, setMaquinasProducao] = useState<Maquina[]>([])
  const [maquinasFinalizadas, setMaquinasFinalizadas] = useState<Maquina[]>([])
  const [novoModelo, setNovoModelo] = useState('')
  const [novoSerial, setNovoSerial] = useState('')
  const [novoFabricante, setNovoFabricante] = useState('')
  const [novoStatus, setNovoStatus] = useState('disponível')

  const [tecnicos, setTecnicos] = useState<Tecnico[]>([
    { id: 1, nome: 'Pedro', login: 'Pedro', senha: 'Connect123@', isMaster: true },
    { id: 2, nome: 'Felipe', login: 'Felipe', senha: 'Connect123@', isMaster: true },
  ])
  const [novoTecnico, setNovoTecnico] = useState<Omit<Tecnico, 'id'>>({ nome: '', login: '', senha: '', isMaster: false })

  const [filtroProducao, setFiltroProducao] = useState('')
  const [tipoFiltroProducao, setTipoFiltroProducao] = useState('modelo')

  const [editingMachine, setEditingMachine] = useState<Maquina | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toISOString())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setMaquinasProducao(prevMaquinas => prevMaquinas.map(maquina => ({
        ...maquina,
        etapas: maquina.etapas.map(etapa => {
          if (etapa.concluida && etapa.tempoInicio && !etapa.dataConcluidaEm) {
            const now = Date.now()
            return {
              ...etapa,
              tempoGasto: now - etapa.tempoInicio
            }
          }
          return etapa
        })
      })))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const loginHandler = (login: string, senha: string) => {
    try {
      const tecnico = tecnicos.find(t => t.login === login && t.senha === senha)
      if (tecnico) {
        setTecnicoLogado(tecnico)
        setIsLoggedIn(true)
        setIsMasterLoggedIn(tecnico.isMaster)
        setAlertMessage(`Bem-vindo, ${tecnico.nome}!`)
      } else {
        setAlertMessage('Login ou senha incorretos.')
      }
    } catch (error) {
      console.error("Erro de login:", error)
      setAlertMessage('Erro ao fazer login. Por favor, tente novamente.')
    }
  }

  const logoutHandler = () => {
    try {
      setTecnicoLogado(null)
      setIsLoggedIn(false)
      setIsMasterLoggedIn(false)
      setAlertMessage('Logout realizado com sucesso.')
      setNovoModelo('')
      setNovoSerial('')
      setNovoFabricante('')
      setNovoStatus('disponível')
      setFiltroProducao('')
      setNovoTecnico({ nome: '', login: '', senha: '', isMaster: false })
      setTipoFiltroProducao('modelo')
    } catch (error) {
      console.error("Erro de logout:", error)
      setAlertMessage('Erro ao fazer logout. Por favor, tente novamente.')
    }
  }

  const adicionarMaquina = () => {
    try {
      if (!isLoggedIn) {
        setAlertMessage('Você precisa estar logado para adicionar uma máquina.')
        return
      }
      if (novoModelo && novoSerial && novoFabricante) {
        if (!/^\d+$/.test(novoSerial)) {
          setAlertMessage('O número de série deve conter apenas números.')
          return
        }
        const novaMaquina: Maquina = {
          id: Date.now(),
          modelo: novoModelo,
          serial: novoSerial,
          fabricante: novoFabricante,
          status: novoStatus,
          dataCadastro: currentTime,
          etapas: [
            "Limpeza inicial",
            "Verificação de componentes",
            "Calibragem",
            "Teste de funcionamento",
            "Controle de qualidade",
            "Verificação sistema Vmpay"
          ].map(nome => ({ nome, concluida: false })),
          nomeCliente: '',
          numeroBox: '',
          patrimonio: '',
        }
        setMaquinas(prevMaquinas => [...prevMaquinas, novaMaquina])
        setNovoModelo('')
        setNovoSerial('')
        setNovoFabricante('')
        setNovoStatus('disponível')
        setAlertMessage('Máquina adicionada com sucesso!')
      } else {
        setAlertMessage('Por favor, preencha todos os campos.')
      }
    } catch (error) {
      console.error("Erro ao adicionar máquina:", error)
      setAlertMessage('Erro ao adicionar máquina. Por favor, tente novamente.')
    }
  }

  const moverParaProducao = (id: number) => {
    try {
      const maquina = maquinas.find(m => m.id === id)
      if (maquina) {
        setMaquinasProducao(prevMaquinas => [...prevMaquinas, { ...maquina, status: 'em_producao' }])
        setMaquinas(prevMaquinas => prevMaquinas.filter(m => m.id !== id))
        setAlertMessage('Máquina movida para produção com sucesso!')
      }
    } catch (error) {
      console.error("Erro ao mover máquina para produção:", error)
      setAlertMessage('Erro ao mover máquina para produção. Por favor, tente novamente.')
    }
  }

  const toggleEtapa = (maquinaId: number, etapaIndex: number) => {
    try {
      if (!isLoggedIn) {
        setAlertMessage('Por favor, faça login para realizar o check-in.')
        return
      }

      const maquina = maquinasProducao.find(m => m.id === maquinaId)
      if (!maquina || !maquina.nomeCliente || !maquina.numeroBox || !maquina.patrimonio) {
        setAlertMessage('Por favor, preencha o nome do cliente, número do box e patrimônio antes de realizar o check-in.')
        return
      }

      setMaquinasProducao(prevMaquinas => prevMaquinas.map(maquina => {
        if (maquina.id === maquinaId) {
          const novasEtapas = [...maquina.etapas]
          const etapa = novasEtapas[etapaIndex]
          const now = Date.now()

          if (!etapa.concluida) {
            // Iniciando a etapa
            etapa.dataInicio = new Date().toISOString()
            etapa.concluida = true
            etapa.tecnicoResponsavel = tecnicoLogado?.nome
            etapa.tempoInicio = now
            etapa.tempoGasto = 0
          } else {
            // Finalizando a etapa
            etapa.dataConcluidaEm = new Date().toISOString()
            etapa.tempoGasto = now - (etapa.tempoInicio || now)
          }

          return { ...maquina, etapas: novasEtapas }
        }
        return maquina
      }))
    } catch (error) {
      console.error("Erro ao atualizar etapa:", error)
      setAlertMessage('Erro ao atualizar etapa. Por favor, tente novamente.')
    }
  }

  const concluirMaquina = (maquinaId: number) => {
    try {
      const maquina = maquinasProducao.find(m => m.id === maquinaId)
      if (maquina && maquina.etapas.every(etapa => etapa.concluida)) {
        setMaquinasFinalizadas(prev => [...prev, { ...maquina, status: 'finalizada', dataFinalizacao: currentTime }])
        setMaquinasProducao(prev => prev.filter(m => m.id !== maquinaId))
        setAlertMessage('Máquina concluída com sucesso!')
      } else {
        setAlertMessage('Todas as etapas devem ser concluídas antes de finalizar a máquina.')
      }
    } catch (error) {
      console.error("Erro ao concluir máquina:", error)
      setAlertMessage('Erro ao concluir máquina. Por favor, tente novamente.')
    }
  }

  const adicionarTecnico = () => {
    try {
      if (!isMasterLoggedIn) {
        setAlertMessage('Apenas usuários master podem adicionar novos técnicos.')
        return
      }

      if (novoTecnico.nome && novoTecnico.login && novoTecnico.senha) {
        setTecnicos(prevTecnicos => [...prevTecnicos, { ...novoTecnico, id: Date.now() }])
        setNovoTecnico({ nome: '', login: '', senha: '', isMaster: false })
        setAlertMessage('Técnico adicionado com sucesso!')
      } else {
        setAlertMessage('Por favor, preencha todos os campos do novo técnico.')
      }
    } catch (error) {
      console.error("Erro ao adicionar técnico:", error)
      setAlertMessage('Erro ao adicionar técnico. Por favor, tente novamente.')
    }
  }

  const deleteMachine = (id: number, type: string) => {
    try {
      if (!isMasterLoggedIn) {
        setAlertMessage('Apenas usuários master podem excluir máquinas.')
        return
      }
      if (type === 'finalizada') {
        setMaquinasFinalizadas(prevMaquinas => prevMaquinas.filter(m => m.id !== id))
      } else {
        setMaquinas(prevMaquinas => prevMaquinas.filter(m => m.id !== id))
        setMaquinasProducao(prevMaquinas => prevMaquinas.filter(m => m.id !== id))
      }
      setAlertMessage('Máquina excluída com sucesso!')
    } catch (error) {
      console.error("Erro ao excluir máquina:", error)
      setAlertMessage('Erro ao excluir máquina. Por favor, tente novamente.')
    }
  }

  const openEditDialog = (machine: Maquina, type: string) => {
    try {
      if (!isMasterLoggedIn) {
        setAlertMessage('Apenas usuários master podem editar máquinas.')
        return
      }
      setEditingMachine({ ...machine, type })
      setIsEditDialogOpen(true)
    } catch (error) {
      console.error("Erro ao abrir diálogo de edição:", error)
      setAlertMessage('Erro ao abrir diálogo de edição. Por favor, tente novamente.')
    }
  }

  const saveEditedMachine = () => {
    try {
      if (!editingMachine) return

      const updateMachine = (prevMachines: Maquina[]) =>
        prevMachines.map(m => m.id === editingMachine.id ? { ...editingMachine, type: undefined } : m)

      if (editingMachine.type === 'finalizada') {
        setMaquinasFinalizadas(updateMachine)
      } else if (editingMachine.status === 'em_producao') {
        setMaquinasProducao(updateMachine)
      } else {
        setMaquinas(updateMachine)
      }

      setIsEditDialogOpen(false)
      setEditingMachine(null)
      setAlertMessage('Máquina atualizada com sucesso!')
    } catch (error) {
      console.error("Erro ao salvar alterações da máquina:", error)
      setAlertMessage('Erro ao salvar alterações da máquina. Por favor, tente novamente.')
    }
  }

  const gerarRelatorioExcel = () => {
    try {
      // Organizar os dados em seções
      const dadosRelatorio = [...maquinasProducao, ...maquinasFinalizadas].map(maquina => {
        // Informações básicas da máquina
        const infoBasica = {
          'Seção 1 - Informações da Máquina': '',
          'ID': maquina.id,
          'Modelo': maquina.modelo,
          'Número de Série': maquina.serial,
          'Fabricante': maquina.fabricante,
          'Status': maquina.status,
          'Data de Cadastro': formatDateTime(maquina.dataCadastro),
        }

        // Informações do cliente
        const infoCliente = {
          'Seção 2 - Informações do Cliente': '',
          'Nome do Cliente': maquina.nomeCliente,
          'Número do Box': maquina.numeroBox,
          'Patrimônio': maquina.patrimonio,
        }

        // Informações de conclusão
        const infoFinalizacao = {
          'Seção 3 - Informações de Finalização': '',
          'Data de Finalização': maquina.dataFinalizacao ? formatDateTime(maquina.dataFinalizacao) : 'N/A',
          'Tempo Total de Preparação': formatTime(maquina.etapas.reduce((total, etapa) => total + (etapa.tempoGasto || 0), 0)),
        }

        // Informações detalhadas das etapas
        const infoEtapas = {
          'Seção 4 - Detalhamento das Etapas': '',
          ...maquina.etapas.reduce((acc, etapa, index) => ({
            ...acc,
            [`Etapa ${index + 1} - Nome`]: etapa.nome,
            [`Etapa ${index + 1} - Técnico`]: etapa.tecnicoResponsavel || 'N/A',
            [`Etapa ${index + 1} - Início`]: etapa.dataInicio ? formatDateTime(etapa.dataInicio) : 'N/A',
            [`Etapa ${index + 1} - Conclusão`]: etapa.dataConcluidaEm ? formatDateTime(etapa.dataConcluidaEm) : 'N/A',
            [`Etapa ${index + 1} - Tempo Gasto`]: formatTime(etapa.tempoGasto || 0),
          }), {})
        }

        // Combinar todas as seções
        return {
          ...infoBasica,
          ...infoCliente,
          ...infoFinalizacao,
          ...infoEtapas,
        }
      })

      const ws = XLSX.utils.json_to_sheet(dadosRelatorio)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Relatório de Máquinas")

      // Ajustar largura das colunas
      const maxWidth = 50
      const wscols = Object.keys(dadosRelatorio[0] || {}).map(() => ({ wch: maxWidth }))
      ws['!cols'] = wscols

      XLSX.writeFile(wb, `relatorio_maquinas_${formatDateTime(new Date().toISOString()).replace(/[/:]/g, '-')}.xlsx`)
    } catch (error) {
      console.error("Erro ao gerar relatório:", error)
      setAlertMessage('Erro ao gerar relatório. Por favor, tente novamente.')
    }
  }

  const modelosMaquinas = [
    'Solista', 'Phedra', 'Koro', 'Krea Prime', 'Lirika', 'Magenta', 'XX', 'XS',
    'Kalea', 'Korinto', 'Karisma', 'Rubino', 'Concerto', 'Opera', 'Brio Up',
    'Colibri', 'Quarzo', 'Style', '9100', '8800'
  ]

  const getManufacturerByModel = (model: string) => {
    const manufacturers: { [key: string]: string } = {
      'Solista': 'Necta',
      'Phedra': 'Necta',
      'Koro': 'Necta',
      'Krea Prime': 'Necta',
      'Lirika': 'Saeco',
      'Magenta': 'Saeco',
      'XX': 'Saeco',
      'XS': 'Saeco',
      'Kalea': 'Necta',
      'Korinto': 'Necta',
      'Karisma': 'Necta',
      'Rubino': 'Saeco',
      'Concerto': 'Necta',
      'Opera': 'Necta',
      'Brio Up': 'Necta',
      'Colibri': 'Rheavendors',
      'Quarzo': 'Rheavendors',
      'Style': 'Rheavendors',
      '9100': 'Necta',
      '8800': 'Necta'
    };
    return manufacturers[model] || '';
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <LoginComponent
        isLoggedIn={isLoggedIn}
        tecnicoLogado={tecnicoLogado}
        loginHandler={loginHandler}
        logoutHandler={logoutHandler}
      />
      {alertMessage && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4" role="alert">
          <p>{alertMessage}</p>
        </div>
      )}
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="abastecimento">Abastecimento</TabsTrigger>
          <TabsTrigger value="producao">Produção</TabsTrigger>
          <TabsTrigger value="concluidas">Concluídas</TabsTrigger>
          <TabsTrigger value="gerenciamento">Gerenciamento</TabsTrigger>
        </TabsList>
        <TabsContent value="abastecimento">
          <Card>
            <CardHeader>
              <CardTitle>Abastecimento de Máquinas</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoggedIn ? (
                <>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Select
                        value={novoModelo}
                        onValueChange={(value) => {
                          setNovoModelo(value);
                          setNovoFabricante(getManufacturerByModel(value));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o modelo" />
                        </SelectTrigger>
                        <SelectContent>
                          {modelosMaquinas.map((modelo) => (
                            <SelectItem key={modelo} value={modelo}>
                              {modelo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Número de série (apenas números)"
                        value={novoSerial}
                        onChange={(e) => setNovoSerial(e.target.value.replace(/\D/g, ''))}
                      />
                      <Input
                        placeholder="Fabricante"
                        value={novoFabricante}
                        readOnly
                      />
                      <Select value={novoStatus} onValueChange={setNovoStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="disponível">Disponível</SelectItem>
                          <SelectItem value="em_uso">Em Uso</SelectItem>
                          <SelectItem value="manutenção">Manutenção</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={adicionarMaquina}>Adicionar Máquina</Button>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Máquinas Cadastradas</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Modelo</TableHead>
                          <TableHead>Número de Série</TableHead>
                          <TableHead>Fabricante</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Ação</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {maquinas.length > 0 ? (
                          maquinas.map((maquina) => (
                            <TableRow key={maquina.id}>
                              <TableCell>{maquina.modelo}</TableCell>
                              <TableCell>{maquina.serial}</TableCell>
                              <TableCell>{maquina.fabricante}</TableCell>
                              <TableCell>{maquina.status}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button onClick={() => moverParaProducao(maquina.id)}>Mover para Produção</Button>
                                  {isMasterLoggedIn && (
                                    <>
                                      <Button onClick={() => openEditDialog(maquina, 'abastecimento')} variant="outline" size="icon">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button onClick={() => deleteMachine(maquina.id, 'abastecimento')} variant="outline" size="icon">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center">Nenhuma máquina cadastrada</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : (
                <p>Você precisa estar logado para acessar esta seção.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="producao">
          <Card>
            <CardHeader>
              <CardTitle>Produção</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoggedIn ? (
                <>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Painel de Produção</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Máquinas em Produção</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-4xl font-bold">{maquinasProducao.length}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Máquinas Finalizadas</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-4xl font-bold">{maquinasFinalizadas.length}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Filtrar Máquinas</h3>
                    <div className="flex space-x-2">
                      <Select value={tipoFiltroProducao} onValueChange={setTipoFiltroProducao}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Tipo de filtro" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="modelo">Modelo</SelectItem>
                          <SelectItem value="serial">Número de Série</SelectItem>
                          <SelectItem value="patrimonio">Patrimônio</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Filtrar máquinas..."
                        value={filtroProducao}
                        onChange={(e) => setFiltroProducao(e.target.value)}
                      />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-4">Máquinas em Produção</h3>
                  {maquinasProducao.length > 0 ? (
                    maquinasProducao.map((maquina) => (
                      <Card key={maquina.id} className="mb-4">
                        <CardHeader>
                          <CardTitle>{maquina.modelo} - {maquina.serial} ({maquina.fabricante})</CardTitle>
                          <CardDescription>
                            Tempo Total de Preparação: {formatTime(maquina.etapas.reduce((total, etapa) => total + (etapa.tempoGasto || 0), 0))}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-4">
                            <h4 className="text-md font-semibold mb-2">Informações do Cliente:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Input
                                placeholder="Nome do Cliente"
                                value={maquina.nomeCliente}
                                onChange={(e) => {
                                  const updatedMaquinas = maquinasProducao.map(m =>
                                    m.id === maquina.id ? { ...m, nomeCliente: e.target.value } : m
                                  );
                                  setMaquinasProducao(updatedMaquinas);
                                }}
                              />
                              <Input
                                placeholder="Número do Box"
                                value={maquina.numeroBox}
                                onChange={(e) => {
                                  const updatedMaquinas = maquinasProducao.map(m =>
                                    m.id === maquina.id ? { ...m, numeroBox: e.target.value } : m
                                  );
                                  setMaquinasProducao(updatedMaquinas);
                                }}
                              />
                              <Input
                                placeholder="Patrimônio"
                                value={maquina.patrimonio}
                                onChange={(e) => {
                                  const updatedMaquinas = maquinasProducao.map(m =>
                                    m.id === maquina.id ? { ...m, patrimonio: e.target.value } : m
                                  );
                                  setMaquinasProducao(updatedMaquinas);
                                }}
                              />
                            </div>
                          </div>
                          <h4 className="text-md font-semibold mb-2">Checklist de Etapas:</h4>
                          {maquina.etapas.map((etapa, index) => (
                            <div key={index} className="flex items-center space-x-2 mb-2">
                              <Checkbox
                                id={`etapa-${maquina.id}-${index}`}
                                checked={etapa.concluida}
                                onCheckedChange={() => toggleEtapa(maquina.id, index)}
                              />
                              <label
                                htmlFor={`etapa-${maquina.id}-${index}`}
                                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                                  etapa.concluida && etapa.dataConcluidaEm ? 'line-through' : ''
                                }`}
                              >
                                {etapa.nome}
                                {etapa.concluida && (
                                  <>
                                    {' '}(Técnico: {etapa.tecnicoResponsavel})
                                    {' '}| Início: {formatDateTime(etapa.dataInicio || '')}
                                    {etapa.dataConcluidaEm && (
                                      <>
                                        {' '}| Conclusão: {formatDateTime(etapa.dataConcluidaEm)}
                                        {' '}| Tempo: {formatTime(etapa.tempoGasto || 0)}
                                      </>
                                    )}
                                  </>
                                )}
                              </label>
                            </div>
                          ))}
                          {maquina.etapas.every(etapa => etapa.concluida) && (
                            <Button
                              onClick={() => concluirMaquina(maquina.id)}
                              className="mt-4"
                              variant="outline"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" /> Concluir Máquina
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p>Nenhuma máquina em produção</p>
                  )}
                </>
              ) : (
                <p>Você precisa estar logado para acessar esta seção.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="concluidas">
          <Card>
            <CardHeader>
              <CardTitle>Máquinas Concluídas</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoggedIn ? (
                <>
                  <h3 className="text-lg font-semibold mb-4">Lista de Máquinas Concluídas</h3>
                  {maquinasFinalizadas.length > 0 ? (
                    maquinasFinalizadas.map((maquina) => (
                      <Card key={maquina.id} className="mb-4">
                        <CardHeader>
                          <CardTitle>{maquina.modelo} - {maquina.serial} ({maquina.fabricante})</CardTitle>
                          <CardDescription>
                            Tempo Total de Preparação: {formatTime(maquina.etapas.reduce((total, etapa) => total + (etapa.tempoGasto || 0), 0))}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p><strong>Cliente:</strong> {maquina.nomeCliente}</p>
                              <p><strong>Número do Box:</strong> {maquina.numeroBox}</p>
                              <p><strong>Patrimônio:</strong> {maquina.patrimonio}</p>
                            </div>
                            <div>
                              <p><strong>Data de Cadastro:</strong> {formatDateTime(maquina.dataCadastro)}</p>
                              <p><strong>Data de Finalização:</strong> {maquina.dataFinalizacao ? formatDateTime(maquina.dataFinalizacao) : 'N/A'}</p>
                            </div>
                          </div>
                          <h4 className="text-md font-semibold mt-4 mb-2">Etapas Concluídas:</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Etapa</TableHead>
                                <TableHead>Técnico</TableHead>
                                <TableHead>Data e Hora de Conclusão</TableHead>
                                <TableHead>Tempo Gasto</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {maquina.etapas.map((etapa, index) => (
                                <TableRow key={index}>
                                  <TableCell>{etapa.nome}</TableCell>
                                  <TableCell>{etapa.tecnicoResponsavel}</TableCell>
                                  <TableCell>{etapa.dataConcluidaEm ? formatDateTime(etapa.dataConcluidaEm) : 'N/A'}</TableCell>
                                  <TableCell>{formatTime(etapa.tempoGasto || 0)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          {isMasterLoggedIn && (
                            <div className="mt-4 flex space-x-2">
                              <Button onClick={() => openEditDialog(maquina, 'finalizada')} variant="outline" size="sm">
                                <Edit className="mr-2 h-4 w-4" /> Editar
                              </Button>
                              <Button onClick={() => deleteMachine(maquina.id, 'finalizada')} variant="outline" size="sm">
                                <Trash2 className="mr-2 h-4 w-4" /> Excluir
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p>Nenhuma máquina concluída</p>
                  )}
                </>
              ) : (
                <p>Você precisa estar logado para acessar esta seção.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="gerenciamento">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento</CardTitle>
            </CardHeader>
            <CardContent>
              {isMasterLoggedIn ? (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Adicionar Novo Técnico</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Input
                        placeholder="Nome do Técnico"
                        value={novoTecnico.nome}
                        onChange={(e) => setNovoTecnico({...novoTecnico, nome: e.target.value})}
                      />
                      <Input
                        placeholder="Login"
                        value={novoTecnico.login}
                        onChange={(e) => setNovoTecnico({...novoTecnico, login: e.target.value})}
                      />
                      <Input
                        type="password"
                        placeholder="Senha"
                        value={novoTecnico.senha}
                        onChange={(e) => setNovoTecnico({...novoTecnico, senha: e.target.value})}
                      />
                      <Select
                        value={novoTecnico.isMaster ? "master" : "comum"}
                        onValueChange={(value) => setNovoTecnico({...novoTecnico, isMaster: value === "master"})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo de Usuário" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comum">Comum</SelectItem>
                          <SelectItem value="master">Master</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={adicionarTecnico}>
                      <Plus className="mr-2 h-4 w-4" /> Adicionar Técnico
                    </Button>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Técnicos Cadastrados</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Login</TableHead>
                          <TableHead>Tipo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tecnicos.map((tecnico) => (
                          <TableRow key={tecnico.id}>
                            <TableCell>{tecnico.nome}</TableCell>
                            <TableCell>{tecnico.login}</TableCell>
                            <TableCell>{tecnico.isMaster ? 'Master' : 'Comum'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Relatórios</h3>
                    <Button onClick={gerarRelatorioExcel}>
                      <FileDown className="mr-2 h-4 w-4" /> Extrair Relatório Excel
                    </Button>
                  </div>
                </>
              ) : (
                <p>Você não tem acesso a essa seção.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Máquina</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="modelo" className="text-right">
                Modelo
              </Label>
              <Input
                id="modelo"
                value={editingMachine?.modelo || ''}
                onChange={(e) => setEditingMachine({...editingMachine, modelo: e.target.value} as Maquina)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="serial" className="text-right">
                Número de Série
              </Label>
              <Input
                id="serial"
                value={editingMachine?.serial || ''}
                onChange={(e) => setEditingMachine({...editingMachine, serial: e.target.value} as Maquina)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fabricante" className="text-right">
                Fabricante
              </Label>
              <Input
                id="fabricante"
                value={editingMachine?.fabricante || ''}
                onChange={(e) => setEditingMachine({...editingMachine, fabricante: e.target.value} as Maquina)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={saveEditedMachine}>Salvar alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}