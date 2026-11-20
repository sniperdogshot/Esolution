-- Esolution Database Schema
-- Tabela principal de atendimentos/leads

CREATE TABLE IF NOT EXISTS atendimentos (
    id SERIAL PRIMARY KEY,
    telefone VARCHAR(20) NOT NULL,
    valor_conta DECIMAL(10,2),
    etapa VARCHAR(50) NOT NULL DEFAULT 'inicio',
    cidade VARCHAR(100),
    aumento_consumo VARCHAR(20),
    equipamento VARCHAR(100),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_atendimentos_telefone ON atendimentos(telefone);
CREATE INDEX IF NOT EXISTS idx_atendimentos_etapa ON atendimentos(etapa);
CREATE INDEX IF NOT EXISTS idx_atendimentos_cidade ON atendimentos(cidade);
CREATE INDEX IF NOT EXISTS idx_atendimentos_criado_em ON atendimentos(criado_em);

-- Dados de exemplo para desenvolvimento
INSERT INTO atendimentos (telefone, valor_conta, etapa, cidade, aumento_consumo, equipamento, criado_em) VALUES
-- Leads finalizados
('85999990001', 450.00, 'finalizado', 'Fortaleza', 'sim', 'Ar condicionado 12000 BTUs', NOW() - INTERVAL '2 days'),
('85999990002', 320.50, 'finalizado', 'Eusébio', 'não', NULL, NOW() - INTERVAL '5 days'),
('85999990003', 680.00, 'finalizado', 'Fortaleza', 'sim', 'Geladeira Frost Free', NOW() - INTERVAL '10 days'),
('85999990004', 275.00, 'encerrado', 'Maracanaú', 'não', NULL, NOW() - INTERVAL '15 days'),
('85999990005', 510.00, 'finalizado', 'Fortaleza', 'sim', 'Máquina de lavar 11kg', NOW() - INTERVAL '20 days'),

-- Leads em andamento (etapas intermediárias)
('85999990006', 380.00, 'conta', 'Fortaleza', NULL, NULL, NOW() - INTERVAL '1 day'),
('85999990007', 420.00, 'aumento_consumo', 'Caucaia', 'sim', NULL, NOW() - INTERVAL '3 days'),
('85999990008', 290.00, 'equipamento', 'Fortaleza', 'não', 'Micro-ondas', NOW() - INTERVAL '4 days'),
('85999990009', 550.00, 'cidade', 'Eusébio', 'sim', 'Ar condicionado 9000 BTUs', NOW() - INTERVAL '6 days'),
('85999990010', 310.00, 'conta', 'Fortaleza', NULL, NULL, NOW() - INTERVAL '7 days'),

-- Leads iniciais
('85999990011', NULL, 'inicio', NULL, NULL, NULL, NOW() - INTERVAL '1 hour'),
('85999990012', NULL, 'inicio', NULL, NULL, NULL, NOW() - INTERVAL '3 hours'),
('85999990013', NULL, 'inicio', NULL, NULL, NULL, NOW() - INTERVAL '1 day'),

-- Mais dados para gráficos (últimos 30 dias)
('85999990014', 400.00, 'finalizado', 'Fortaleza', 'sim', 'Freezer', NOW() - INTERVAL '8 days'),
('85999990015', 250.00, 'finalizado', 'Maracanaú', 'não', NULL, NOW() - INTERVAL '9 days'),
('85999990016', 600.00, 'finalizado', 'Fortaleza', 'sim', 'Lava-louças', NOW() - INTERVAL '11 days'),
('85999990017', 330.00, 'encerrado', 'Caucaia', 'não', NULL, NOW() - INTERVAL '12 days'),
('85999990018', 480.00, 'finalizado', 'Fortaleza', 'sim', 'Ar condicionado 18000 BTUs', NOW() - INTERVAL '14 days'),
('85999990019', 290.00, 'finalizado', 'Eusébio', 'não', NULL, NOW() - INTERVAL '18 days'),
('85999990020', 410.00, 'finalizado', 'Fortaleza', 'sim', 'Adega', NOW() - INTERVAL '22 days'),
('85999990021', 370.00, 'finalizado', 'Fortaleza', 'não', NULL, NOW() - INTERVAL '25 days'),
('85999990022', 520.00, 'finalizado', 'Maracanaú', 'sim', 'Cervejeira', NOW() - INTERVAL '28 days'),

-- Leads por cidade (para top 10)
('85999990023', 300.00, 'finalizado', 'Fortaleza', 'não', NULL, NOW() - INTERVAL '3 days'),
('85999990024', 280.00, 'finalizado', 'Fortaleza', 'sim', 'Ventilador', NOW() - INTERVAL '4 days'),
('85999990025', 350.00, 'finalizado', 'Fortaleza', 'não', NULL, NOW() - INTERVAL '5 days'),
('85999990026', 420.00, 'finalizado', 'Eusébio', 'sim', 'Purificador', NOW() - INTERVAL '6 days'),
('85999990027', 310.00, 'finalizado', 'Caucaia', 'não', NULL, NOW() - INTERVAL '7 days'),
('85999990028', 390.00, 'finalizado', 'Maracanaú', 'sim', 'Cooktop', NOW() - INTERVAL '8 days'),
('85999990029', 260.00, 'finalizado', 'Fortaleza', 'não', NULL, NOW() - INTERVAL '9 days'),
('85999990030', 340.00, 'finalizado', 'Fortaleza', 'sim', 'Forno', NOW() - INTERVAL '10 days');