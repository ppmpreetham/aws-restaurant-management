import { Payment, Reservation } from '../types';
import { errorMessage } from '../errors';

export interface PublishResult {
  status: 'SENT' | 'FAILED' | 'SKIPPED';
  messageId?: string;
  error?: string;
}

type SnsModule = {
  SNSClient: new (config: { region: string }) => {
    send(command: unknown): Promise<{ MessageId?: string }>;
  };
  PublishCommand: new (input: {
    TopicArn: string;
    Subject: string;
    Message: string;
  }) => unknown;
};

async function loadSnsModule(): Promise<SnsModule> {
  const dynamicImport = new Function('specifier', 'return import(specifier)');
  return (await dynamicImport('@aws-sdk/client-sns')) as SnsModule;
}

export async function publishReservationConfirmation(
  reservation: Reservation,
  payment: Payment
): Promise<PublishResult> {
  const topicArn = process.env.SNS_TOPIC_ARN?.trim();
  if (!topicArn) {
    return { status: 'SKIPPED', error: 'SNS_TOPIC_ARN is not configured' };
  }

  try {
    const { SNSClient, PublishCommand } = await loadSnsModule();
    const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1';
    const client = new SNSClient({ region });
    const command = new PublishCommand({
      TopicArn: topicArn,
      Subject: 'Reservation confirmed',
      Message: JSON.stringify(
        {
          type: 'RESERVATION_CONFIRMED',
          reservationId: reservation.id,
          restaurantId: reservation.restaurant_id,
          customerEmail: reservation.customer_email,
          reservationDate: reservation.reservation_date,
          slotStart: reservation.slot_start,
          slotEnd: reservation.slot_end,
          partySize: reservation.party_size,
          paymentId: payment.id,
          amountCents: payment.amount_cents,
          currency: payment.currency,
        },
        null,
        2
      ),
    });

    const response = await client.send(command);
    return { status: 'SENT', messageId: response.MessageId };
  } catch (error) {
    return { status: 'FAILED', error: errorMessage(error) };
  }
}
