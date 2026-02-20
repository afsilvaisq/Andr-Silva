
import { Asset, Sensor } from "../types";
import { GoogleGenAI } from "@google/genai";

const DESTINATARIO = "andremfdsilva@outlook.com";
const lastAlerts: Record<string, number> = {};

export async function sendAlarmEmail(asset: Asset, sensor: Sensor) {
  // Evitar múltiplos e-mails para o mesmo ativo nos últimos 5 minutos
  const now = Date.now();
  if (lastAlerts[asset.id] && now - lastAlerts[asset.id] < 300000) {
    return null;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Gere um e-mail de alerta técnico urgente de manutenção industrial.
    Destinatário: ${DESTINATARIO}
    Equipamento: ${asset.name}
    Localização: ${asset.location}
    Sensor em Falha: ${sensor.label}
    Valor Atual: ${sensor.currentValue}${sensor.unit}
    Limite de Alarme: ${sensor.thresholdMax}${sensor.unit}
    Severidade: ${asset.severity}

    O e-mail deve ser profissional, direto e incluir:
    1. Assunto urgente mencionando o TAG do equipamento.
    2. Descrição técnica da violação do limite (ISO 20816-3).
    3. Sugestão de inspeção imediata baseada na severidade ${asset.severity}.

    Responda apenas com o conteúdo do e-mail (Assunto e Corpo).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const emailContent = response.text;
    
    // Simulação de envio (Logs no console e retorno para UI)
    console.log(`%c[EMAIL SENT TO ${DESTINATARIO}]`, "background: #be123c; color: white; padding: 4px 8px; border-radius: 4px;");
    console.log(emailContent);

    lastAlerts[asset.id] = now;
    return {
      to: DESTINATARIO,
      content: emailContent,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Erro ao gerar e-mail de alerta:", error);
    return null;
  }
}
