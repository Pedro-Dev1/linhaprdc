"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Maquina {
  id: string;
  modelo: string;
  serial: string;
  fabricante: string;
  status: 'disponível' | 'em_uso' | 'manutenção';
  dataCadastro: string;
}

interface Tecnico {
  id: number
  nome: string
  login: string
  senha: string
  isMaster: boolean
}

interface LoginComponentProps {
  isLoggedIn: boolean
  tecnicoLogado: Tecnico | null
  onLogin: (login: string, senha: string) => void
  onLogout: () => void
}

// Componente de Login separado
const LoginComponent = ({ isLoggedIn, tecnicoLogado, onLogin, onLogout }: LoginComponentProps) => {
  const [loginTecnico, setLoginTecnico] = useState('')
  const [senhaTecnico, setSenhaTecnico] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(loginTecnico, senhaTecnico)
    setLoginTecnico('')
    setSenhaTecnico('')
  }

  if (!isLoggedIn) {
    return (
      <form onSubmit={handleLogin}>
        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
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
            <Button type="submit">Login</Button>
          </div>
        </div>
      </form>
    )
  }

  return (
    <div className="mb-4 p-4 bg-gray-100 rounded-lg">
      <div className="flex items-center justify-between">
        <p>Usuário logado: {tecnicoLogado?.nome}</p>
        <Button onClick={onLogout}>Logout</Button>
      </div>
    </div>
  )
}

// Dados iniciais estáticos
const INITIAL_TECNICOS: Tecnico[] = [
  { id: 1, nome: 'Pedro', login: 'Pedro', senha: 'Connect123@', isMaster: true },
  { id: 2, nome: 'Felipe', login: 'Felipe', senha: 'Connect123@', isMaster: true },
]

export default function PainelCompleto() {
  // Estado básico
  const [currentTab, setCurrentTab] = useState('abastecimento')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isMasterLoggedIn, setIsMasterLoggedIn] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [tecnicoLogado, setTecnicoLogado] = useState<Tecnico | null>(null)

  // Estado do formulário
  const [novoModelo, setNovoModelo] = useState('')
  const [novoSerial, setNovoSerial] = useState('')
  const [novoFabricante, setNovoFabricante] = useState('')
  const [novoStatus, setNovoStatus] = useState('disponível')

  // Estado das máquinas
  const [maquinas, setMaquinas] = useState<Maquina[]>([])
  const [maquinasProducao, setMaquinasProducao] = useState<Maquina[]>([])
  const [maquinasFinalizadas, setMaquinasFinalizadas] = useState<Maquina[]>([])

  // Estado dos técnicos
  const tecnicos = INITIAL_TECNICOS; //Removed unnecessary state and destructuring

  useEffect(() => {
    // Aqui você pode adicionar qualquer lógica necessária que estava no useEffect anterior
    // Por exemplo, carregar dados iniciais, configurar listeners, etc.
  }, []);

  const handleLogin = (login: string, senha: string) => {
    const tecnico = tecnicos.find(t => t.login === login && t.senha === senha)
    if (tecnico) {
      setTecnicoLogado(tecnico)
      setIsLoggedIn(true)
      setIsMasterLoggedIn(tecnico.isMaster)
      setAlertMessage(`Bem-vindo, ${tecnico.nome}!`)
    } else {
      setAlertMessage('Login ou senha incorretos.')
    }
  }

  const handleLogout = () => {
    setTecnicoLogado(null)
    setIsLoggedIn(false)
    setIsMasterLoggedIn(false)
    setAlertMessage('Logout realizado com sucesso.')
    // Limpar estados do formulário
    setNovoModelo('')
    setNovoSerial('')
    setNovoFabricante('')
    setNovoStatus('disponível')
  }

  const handleAddMaquina = () => {
    if (!isLoggedIn) {
      setAlertMessage('Você precisa estar logado para adicionar uma máquina.')
      return
    }

    if (!novoModelo || !novoSerial || !novoFabricante) {
      setAlertMessage('Por favor, preencha todos os campos.')
      return
    }

    const novaMaquina: Maquina = {
      id: String(Date.now()),
      modelo: novoModelo,
      serial: novoSerial,
      fabricante: novoFabricante,
      status: novoStatus as 'disponível' | 'em_uso' | 'manutenção',
      dataCadastro: new Date().toISOString(),
    }

    setMaquinas(prev => [...prev, novaMaquina])
    setNovoModelo('')
    setNovoSerial('')
    setNovoFabricante('')
    setNovoStatus('disponível')
    setAlertMessage('Máquina adicionada com sucesso!')
  }

  const moverParaProducao = (maquina: Maquina) => {
    setMaquinas(prev => prev.filter(m => m.id !== maquina.id));
    setMaquinasProducao(prev => [...prev, { ...maquina, status: 'em_uso' }]);
  }

  const finalizarProducao = (maquina: Maquina) => {
    setMaquinasProducao(prev => prev.filter(m => m.id !== maquina.id));
    setMaquinasFinalizadas(prev => [...prev, { ...maquina, status: 'disponível' }]);
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <LoginComponent
        isLoggedIn={isLoggedIn}
        tecnicoLogado={tecnicoLogado}
        onLogin={handleLogin}
        onLogout={handleLogout}
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
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input
                      placeholder="Modelo"
                      value={novoModelo}
                      onChange={(e) => setNovoModelo(e.target.value)}
                    />
                    <Input
                      placeholder="Número de série"
                      value={novoSerial}
                      onChange={(e) => setNovoSerial(e.target.value)}
                    />
                    <Input
                      placeholder="Fabricante"
                      value={novoFabricante}
                      onChange={(e) => setNovoFabricante(e.target.value)}
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
                  <Button onClick={handleAddMaquina}>Adicionar Máquina</Button>
                </div>
              ) : (
                <p>Você precisa estar logado para acessar esta seção.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="producao">
          <Card>
            <CardHeader>
              <CardTitle>Máquinas em Produção</CardTitle>
            </CardHeader>
            <CardContent>
              {maquinasProducao.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Serial</TableHead>
                      <TableHead>Fabricante</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maquinasProducao.map((maquina) => (
                      <TableRow key={maquina.id}>
                        <TableCell>{maquina.modelo}</TableCell>
                        <TableCell>{maquina.serial}</TableCell>
                        <TableCell>{maquina.fabricante}</TableCell>
                        <TableCell>{maquina.status}</TableCell>
                        <TableCell>
                          <Button onClick={() => finalizarProducao(maquina)}>Finalizar Produção</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>Não há máquinas em produção no momento.</p>
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
              {maquinasFinalizadas.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Serial</TableHead>
                      <TableHead>Fabricante</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maquinasFinalizadas.map((maquina) => (
                      <TableRow key={maquina.id}>
                        <TableCell>{maquina.modelo}</TableCell>
                        <TableCell>{maquina.serial}</TableCell>
                        <TableCell>{maquina.fabricante}</TableCell>
                        <TableCell>{maquina.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>Não há máquinas finalizadas no momento.</p>
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
                <p>Conteúdo da seção de gerenciamento</p>
              ) : (
                <p>Você precisa ser um usuário master para acessar esta seção.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Card>
        <CardHeader>
          <CardTitle>Máquinas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Modelo</TableHead>
                <TableHead>Serial</TableHead>
                <TableHead>Fabricante</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {maquinas.map((maquina) => (
                <TableRow key={maquina.id}>
                  <TableCell>{maquina.modelo}</TableCell>
                  <TableCell>{maquina.serial}</TableCell>
                  <TableCell>{maquina.fabricante}</TableCell>
                  <TableCell>{maquina.status}</TableCell>
                  <TableCell>
                    <Button onClick={() => moverParaProducao(maquina)}>Mover para Produção</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}