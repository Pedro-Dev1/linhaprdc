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
import { FileDown, CheckCircle, Edit, Trash2, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

const LoginComponent = ({ isLoggedIn, tecnicoLogado, loginHandler, logoutHandler }) => {
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
          <Button onClick={handleLogin}>Login</Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p>Usuário logado: {tecnicoLogado.nome}</p>
          <Button onClick={logoutHandler}>Logout</Button>
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
  const [tecnicoLogado, setTecnicoLogado] = useState(null)

  const [maquinas, setMaquinas] = useState([])
  const [maquinasProducao, setMaquinasProducao] = useState([])
  const [maquinasFinalizadas, setMaquinasFinalizadas] = useState([])
  const [novoModelo, setNovoModelo] = useState('')
  const [novoSerial, setNovoSerial] = useState('')
  const [novoFabricante, setNovoFabricante] = useState('')
  const [novoStatus, setNovoStatus] = useState('disponível')

  const [tecnicos, setTecnicos] = useState([
    { id: 1, nome: 'Pedro', login: 'Pedro', senha: 'Connect123@', isMaster: true },
    { id: 2, nome: 'Felipe', login: 'Felipe', senha: 'Connect123@', isMaster: true },
  ])
  const [novoTecnico, setNovoTecnico] = useState({ nome: '', login: '', senha: '', isMaster: false })

  const [tipoRelatorio, setTipoRelatorio] = useState('producao')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  const [filtroProducao, setFiltroProducao] = useState('')
  const [tipoFiltroProducao, setTipoFiltroProducao] = useState('modelo')

  const [currentTime, setCurrentTime] = useState('')

  const [editingMachine, setEditingMachine] = useState(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentTime(new Date().toISOString())
    }
  }, [])

  const formatDate = (date: string) => {
    if (typeof window === 'undefined') return ''
    try {
      return new Date(date).toLocaleString()
    } catch (e) {
      console.error("Error formatting date:", e)
      return ''
    }
  }

  const etapas = [
    "Limpeza inicial",
    "Verificação de componentes",
    "Calibragem",
    "Teste de funcionamento",
    "Controle de qualidade",
    "Verificação sistema Vmpay"
  ]

  const modelosMaquinas = [
    'Solista', 'Phedra', 'Koro', 'Krea Prime', 'Lirika', 'Magenta', 'XX', 'XS',
    'Kalea', 'Korinto', 'Karisma', 'Rubino', 'Concerto', 'Opera', 'Brio Up',
    'Colibri', 'Quarzo', 'Style', '9100', '8800'
  ]

  const getManufacturerByModel = (model) => {
    const manufacturers = {
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
        const novaMaquina = {
          id: Date.now(),
          modelo: novoModelo,
          serial: novoSerial,
          fabricante: novoFabricante,
          status: novoStatus,
          dataCadastro: currentTime,
          etapas: etapas.map(etapa => ({ nome: etapa, concluida: false })),
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
      console.error("Error adding machine:", error)
      setAlertMessage('Erro ao adicionar máquina. Por favor, tente novamente.')
    }
  }

  const moverParaProducao = (id) => {
    try {
      const maquina = maquinas.find(m => m.id === id)
      if (maquina) {
        setMaquinasProducao(prevMaquinas => [...prevMaquinas, { ...maquina, status: 'em_producao' }])
        setMaquinas(prevMaquinas => prevMaquinas.filter(m => m.id !== id))
        setAlertMessage('Máquina movida para produção com sucesso!')
      }
    } catch (error) {
      console.error("Error moving machine to production:", error)
      setAlertMessage('Erro ao mover máquina para produção. Por favor, tente novamente.')
    }
  }

  const toggleEtapa = (maquinaId, etapaIndex) => {
    try {
      if (!isLoggedIn) {
        setAlertMessage('Por favor, faça login para realizar o check-in.')
        return
      }

      const maquina = maquinasProducao.find(m => m.id === maquinaId)
      if (!maquina.nomeCliente || !maquina.numeroBox || !maquina.patrimonio) {
        setAlertMessage('Por favor, preencha o nome do cliente, número do box e patrimônio antes de realizar o check-in.')
        return
      }

      setMaquinasProducao(prevMaquinas => prevMaquinas.map(maquina => {
        if (maquina.id === maquinaId) {
          const novasEtapas = [...maquina.etapas]
          novasEtapas[etapaIndex] = {
            ...novasEtapas[etapaIndex],
            concluida: !novasEtapas[etapaIndex].concluida,
            dataConcluidaEm: currentTime,
            tecnicoResponsavel: tecnicoLogado.nome
          }
          return { ...maquina, etapas: novasEtapas }
        }
        return maquina
      }))
    } catch (error) {
      console.error("Error toggling step:", error)
      setAlertMessage('Erro ao atualizar etapa. Por favor, tente novamente.')
    }
  }

  const concluirMaquina = (maquinaId) => {
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
      console.error("Error concluding machine:", error)
      setAlertMessage('Erro ao concluir máquina. Por favor, tente novamente.')
    }
  }

  const loginHandler = (login, senha) => {
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
      console.error("Login error:", error)
      setAlertMessage('Erro ao fazer login. Por favor, tente novamente.')
    }
  }

  const logoutHandler = () => {
    try {
      setTecnicoLogado(null)
      setIsLoggedIn(false)
      setIsMasterLoggedIn(false)
      setAlertMessage('Logout realizado com sucesso.')
      // Clear all relevant fields
      setNovoModelo('')
      setNovoSerial('')
      setNovoFabricante('')
      setNovoStatus('disponível')
      setFiltroProducao('')
      setNovoTecnico({ nome: '', login: '', senha: '', isMaster: false })
      setDataInicio('')
      setDataFim('')
      setTipoRelatorio('producao')
      setTipoFiltroProducao('modelo')
    } catch (error) {
      console.error("Logout error:", error)
      setAlertMessage('Erro ao fazer logout. Por favor, tente novamente.')
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
      console.error("Error adding technician:", error)
      setAlertMessage('Erro ao adicionar técnico. Por favor, tente novamente.')
    }
  }

  const gerarRelatorio = () => {
    try {
      if (typeof window === 'undefined') return

      let relatorio = ''
      const timestamp = new Date().toISOString().split('T')[0]

      switch (tipoRelatorio) {
        case 'producao':
          relatorio = `Relatório de Produção (${dataInicio} a ${dataFim}):\n\n`
          maquinasProducao.forEach(maquina => {
            relatorio += `Modelo: ${maquina.modelo}\n`
            relatorio += `Serial: ${maquina.serial}\n`
            relatorio += `Status: ${maquina.status}\n`
            relatorio += `Tempo de Preparação: ${calcularTempoPreparacao(maquina)}\n\n`
          })
          break
        case 'maquinas':
          relatorio = `Relatório de Máquinas (${dataInicio} a ${dataFim}):\n\n`
          maquinasFinalizadas.forEach(maquina => {
            relatorio += `Modelo: ${maquina.modelo}\n`
            relatorio += `Serial: ${maquina.serial}\n`
            relatorio += `Cliente: ${maquina.nomeCliente}\n`
            relatorio += `Patrimônio: ${maquina.patrimonio}\n`
            relatorio += `Tempo Total de Preparação: ${calcularTempoPreparacao(maquina)}\n\n`
          })
          break
        case 'tecnicos':
          relatorio = `Relatório de Técnicos (${dataInicio} a ${dataFim}):\n\n`
          tecnicos.forEach(tecnico => {
            relatorio += `Nome: ${tecnico.nome}\n`
            relatorio += `Login: ${tecnico.login}\n`
            relatorio += `Tipo: ${tecnico.isMaster ? 'Master' : 'Comum'}\n\n`
          })
          break
      }

      const blob = new Blob([relatorio], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio_${tipoRelatorio}_${timestamp}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating report:", error)
      setAlertMessage('Erro ao gerar relatório. Por favor, tente novamente.')
    }
  }

  const calcularTempoPreparacao = (maquina) => {
    if (typeof window === 'undefined' || !maquina.dataCadastro || !maquina.dataFinalizacao) {
      return 'N/A'
    }

    try {
      const dataCadastro = new Date(maquina.dataCadastro)
      const dataFinalizacao = new Date(maquina.dataFinalizacao)

      const diferencaEmMs = dataFinalizacao.getTime() - dataCadastro.getTime()
      const horas = Math.floor(diferencaEmMs / (1000 * 60 * 60))
      const minutos = Math.floor((diferencaEmMs % (1000 * 60 * 60)) / (1000 * 60))
      const segundos = Math.floor((diferencaEmMs % (1000 * 60)) / 1000)

      return `${horas}h ${minutos}m ${segundos}s`
    } catch (e) {
      console.error("Error calculating preparation time:", e)
      return 'N/A'
    }
  }

  const deleteMachine = (id, type) => {
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
      console.error("Error deleting machine:", error)
      setAlertMessage('Erro ao excluir máquina. Por favor, tente novamente.')
    }
  }

  const openEditDialog = (machine, type) => {
    try {
      if (!isMasterLoggedIn) {
        setAlertMessage('Apenas usuários master podem editar máquinas.')
        return
      }
      setEditingMachine({ ...machine, type })
      setIsEditDialogOpen(true)
    } catch (error) {
      console.error("Error opening edit dialog:", error)
      setAlertMessage('Erro ao abrir diálogo de edição. Por favor, tente novamente.')
    }
  }

  const saveEditedMachine = () => {
    try {
      if (!editingMachine) return

      const updateMachine = (prevMachines) =>
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
      console.error("Error saving edited machine:", error)
      setAlertMessage('Erro ao salvar alterações da máquina. Por favor, tente novamente.')
    }
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
                                      <Button onClick={() => openEditDialog(maquina)} variant="outline" size="icon">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button onClick={() => deleteMachine(maquina.id)} variant="outline" size="icon">
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
                            Tempo Total de Preparação: {calcularTempoPreparacao(maquina)}
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
                                disabled={etapa.concluida}
                              />
                              <label
                                htmlFor={`etapa-${maquina.id}-${index}`}
                                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${etapa.concluida ? 'line-through' : ''}`}
                              >
                                {etapa.nome}
                                {etapa.concluida && (
                                  <>
                                    {' '}(Técnico: {etapa.tecnicoResponsavel})
                                    {' '}| Tempo: {calcularTempoPreparacao({
                                      dataCadastro: maquina.dataCadastro,
                                      dataFinalizacao: etapa.dataConcluidaEm
                                    })}
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
                            Tempo Total de Preparação: {calcularTempoPreparacao(maquina)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p><strong>Cliente:</strong> {maquina.nomeCliente}</p>
                              <p><strong>Número do Box:</strong> {maquina.numeroBox}</p>
                              <p><strong>Patrimônio:</strong> {maquina.patrimonio}</p>
                            </div>
                            <div>
                              {typeof window !== 'undefined' && (
                                <>
                                  <p><strong>Data de Cadastro:</strong> {formatDate(maquina.dataCadastro)}</p>
                                  <p><strong>Data de Finalização:</strong> {formatDate(maquina.dataFinalizacao)}</p>
                                </>
                              )}
                            </div>
                          </div>
                          <h4 className="text-md font-semibold mt-4 mb-2">Etapas Concluídas:</h4>
                          <ul>
                            {maquina.etapas.map((etapa, index) => (
                              <li key={index}>
                                {etapa.nome} - Concluída por {etapa.tecnicoResponsavel} em {formatDate(etapa.dataConcluidaEm)}
                              </li>
                            ))}
                          </ul>
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
                onChange={(e) => setEditingMachine({...editingMachine, modelo: e.target.value})}
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
                onChange={(e) => setEditingMachine({...editingMachine, serial: e.target.value})}
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
                onChange={(e) => setEditingMachine({...editingMachine, fabricante: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={editingMachine?.status || ''}
                onValueChange={(value) => setEditingMachine({...editingMachine, status: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponível">Disponível</SelectItem>
                  <SelectItem value="em_uso">Em Uso</SelectItem>
                  <SelectItem value="manutenção">Manutenção</SelectItem>
                  <SelectItem value="finalizada">Finalizada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveEditedMachine}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}