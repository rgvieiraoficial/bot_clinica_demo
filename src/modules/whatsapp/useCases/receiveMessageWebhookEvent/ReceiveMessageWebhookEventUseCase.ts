import { AxiosResponse } from 'axios';

import { IContactsRepository } from '../../repositories/IContactsRepository';
import { ITicketsRepository } from '../../repositories/ITicketsReposity';

import { graphApi } from '../../../../lib/graphApi';

interface IRequest {
  name: string;
  phone_number_id: string;
  from: string;
  message_type: string;
  message: string;
}

interface ISendMessageData {
  messaging_product: string;
  to: string;
  text: {
    body: string;
  };
  messages?: [
    {
      id: string;
    }
  ]
}

class ReceiveMessageWebhookEventUseCase {

  constructor(
    private contactsRepository: IContactsRepository,
    private ticketsReposity: ITicketsRepository
  ) { }

  async execute({ name, phone_number_id, from, message_type, message }: IRequest): Promise<void> {
    console.log(message);

    let contact = null;

    const contactAreadyExists = await this.contactsRepository.findByWhatsAppNumber(from);

    if (!contactAreadyExists) {
      const newContact = await this.contactsRepository.create({
        name,
        whatsapp_number: from,
        phone_number_id,
      });

      contact = newContact;

      await this.ticketsReposity.create({
        stage: 'initial_list_menu',
        status: 1,
        contact_id: newContact.id
      });

      const data = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": contact.whatsapp_number,
        "type": "interactive",
        "interactive": {
          "type": "list",
          "body": {
            "text": `Olá, é um prazer te atender. Seja bem-vindo(a)! 😄\n \nOi, ${contact.name}! Eu sou a Lily, Assistente Virtual da Clínica Vida Plena.\n \nPor favor, selecione um dos botões abaixo para iniciar seu atendimento. 👇`
          },
          "action": {
            "button": "Abrir opções",
            "sections": [
              {
                "title": "Opções disponíveis",
                "rows": [
                  {
                    "id": "btn_book_appointment",
                    "title": "Marcar consulta",

                  },
                  {
                    "id": "btn_faq",
                    "title": "Tirar dúvidas",
                  },
                  {
                    "id": "btn_service_agent",
                    "title": "Falar com atendente",
                  }
                ]
              }
            ]
          }
        }
      };

      const token = process.env.WHATSAPP_TOKEN;

      const url = `/${phone_number_id}/messages?access_token=${token}`;

      try {
        await graphApi.post<ISendMessageData, AxiosResponse<ISendMessageData>>(url, data);
      } catch (err) {
        console.log(err.message);
      }
    } else {
      contact = contactAreadyExists;

      const openTicketByContact = await this.ticketsReposity.findByContactId(contact.id);

      if (openTicketByContact.status === 1) {
        if (message === '#Sair') {
          await this.ticketsReposity.update(openTicketByContact.id, "initial_list_menu", 2);

          const data: ISendMessageData = {
            messaging_product: "whatsapp",
            to: contact.whatsapp_number,
            text: {
              body: 'Atendimento finalizado com sucesso!'
            },
          };

          const token = process.env.WHATSAPP_TOKEN;

          const url = `/${phone_number_id}/messages?access_token=${token}`;

          try {
            await graphApi.post<ISendMessageData, AxiosResponse<ISendMessageData>>(url, data);
          } catch (err) {
            console.log(err.message);
          }
        } else {
          if (message === 'btn_back_to_the_start') {
            await this.ticketsReposity.update(openTicketByContact.id, "initial_list_menu", 1);

            const data = {
              "messaging_product": "whatsapp",
              "recipient_type": "individual",
              "to": contact.whatsapp_number,
              "type": "interactive",
              "interactive": {
                "type": "list",
                "body": {
                  "text": `Por favor, selecione um dos botões abaixo para iniciar seu atendimento. 👇`
                },
                "action": {
                  "button": "Abrir opções",
                  "sections": [
                    {
                      "title": "Opções disponíveis",
                      "rows": [
                        {
                          "id": "btn_book_appointment",
                          "title": "Marcar consulta",

                        },
                        {
                          "id": "btn_faq",
                          "title": "Tirar dúvidas",
                        },
                        {
                          "id": "btn_service_agent",
                          "title": "Falar com atendente",
                        }
                      ]
                    }
                  ]
                }
              }
            };

            const token = process.env.WHATSAPP_TOKEN;

            const url = `/${phone_number_id}/messages?access_token=${token}`;

            try {
              await graphApi.post<ISendMessageData, AxiosResponse<ISendMessageData>>(url, data);
            } catch (err) {
              console.log(err.message);
            }
          } else {
            if (openTicketByContact.stage === 'initial_list_menu') {
              if (message === 'btn_book_appointment') {
                await this.ticketsReposity.update(openTicketByContact.id, "book_appointment_menu", 1);

                const data = {
                  "messaging_product": "whatsapp",
                  "recipient_type": "individual",
                  "to": contact.whatsapp_number,
                  "type": "interactive",
                  "interactive": {
                    "type": "list",
                    "body": {
                      "text": 'Qual é o seu plano de saúde?'
                    },
                    "action": {
                      "button": "Abrir opções",
                      "sections": [
                        {
                          "title": "Opções disponíveis",
                          "rows": [
                            {
                              "id": "btn_book_appointment_unimed_plan",
                              "title": "Unimed",

                            },
                            {
                              "id": "btn_book_appointment_porto_seguro_plan",
                              "title": "Porto Seguro Saúde",
                            },
                            {
                              "id": "btn_book_appointment_particular_plan",
                              "title": "Particular",
                            },
                            {
                              "id": "btn_back_to_the_start",
                              "title": "Voltar ao ínicio",
                            }
                          ]
                        }
                      ]
                    }
                  }
                };

                const token = process.env.WHATSAPP_TOKEN;

                const url = `/${phone_number_id}/messages?access_token=${token}`;

                try {
                  await graphApi.post<ISendMessageData, AxiosResponse<ISendMessageData>>(url, data);
                } catch (err) {
                  console.log(err.message);
                }
              } else if (message === 'btn_faq') {
                console.log('FAQ');
              } else if (message === 'btn_service_agent') {
                await this.ticketsReposity.update(openTicketByContact.id, 'service_agent_flow_end', 1);

                const data: ISendMessageData = {
                  messaging_product: "whatsapp",
                  to: contact.whatsapp_number,
                  text: {
                    body: `Já estou te transferindo para um de meus colegas humanos lhe atender.\n \nEm qualquer momento digite #Sair para encerrar o atendimento.\n \nO número de protocolo desse atendimento é o: 202404653589.`
                  },
                };

                const token = process.env.WHATSAPP_TOKEN;

                const url = `/${phone_number_id}/messages?access_token=${token}`;

                try {
                  await graphApi.post<ISendMessageData, AxiosResponse<ISendMessageData>>(url, data);
                } catch (err) {
                  console.log(err.message);
                }
              }
            } else if (openTicketByContact.stage === 'book_appointment_menu') {
              await this.ticketsReposity.update(openTicketByContact.id, "book_appointment_speciality_list", 1);

              const rows = [
                {
                  "id": "btn_book_cardiolody",
                  "title": "Cardiologia",

                },
                {
                  "id": "btn_book_gp",
                  "title": "Clínica Médica",
                },
                {
                  "id": "btn_book_with_dermatology",
                  "title": "Dermatologia",
                },
                {
                  "id": "btn_book_psychology",
                  "title": "Psicologia",
                },
                {
                  "id": "btn_back_to_the_start",
                  "title": "Voltar ao ínicio",
                }
              ];

              if (message === 'btn_book_appointment_unimed_plan') {
                const data = {
                  "messaging_product": "whatsapp",
                  "recipient_type": "individual",
                  "to": contact.whatsapp_number,
                  "type": "interactive",
                  "interactive": {
                    "type": "list",
                    "body": {
                      "text": 'Você pode ser atendido em nossa clínica usando o seu plano Unimed.\n \nCom qual destes profissionais você desejar marcar um consulta?\n \nEscolha uma das opções abaixo.'
                    },
                    "action": {
                      "button": "Abrir opções",
                      "sections": [
                        {
                          "title": "Opções disponíveis",
                          "rows": rows
                        }
                      ]
                    }
                  }
                };

                const token = process.env.WHATSAPP_TOKEN;

                const url = `/${phone_number_id}/messages?access_token=${token}`;

                try {
                  await graphApi.post<ISendMessageData, AxiosResponse<ISendMessageData>>(url, data);
                } catch (err) {
                  console.log(err.message);
                }
              } else if (message === 'btn_book_appointment_porto_seguro_plan') {
                const data = {
                  "messaging_product": "whatsapp",
                  "recipient_type": "individual",
                  "to": contact.whatsapp_number,
                  "type": "interactive",
                  "interactive": {
                    "type": "list",
                    "body": {
                      "text": 'Você pode ser atendido em nossa clínica usando o seu plano Porto Seguro Saúde.\n \nCom qual destes profissionais você desejar marcar um consulta?\n \nEscolha uma das opções abaixo.'
                    },
                    "action": {
                      "button": "Abrir opções",
                      "sections": [
                        {
                          "title": "Opções disponíveis",
                          "rows": rows,
                        }
                      ]
                    }
                  }
                };

                const token = process.env.WHATSAPP_TOKEN;

                const url = `/${phone_number_id}/messages?access_token=${token}`;

                try {
                  await graphApi.post<ISendMessageData, AxiosResponse<ISendMessageData>>(url, data);
                } catch (err) {
                  console.log(err.message);
                }
              } else if (message === 'btn_book_appointment_particular_plan') {
                const data = {
                  "messaging_product": "whatsapp",
                  "recipient_type": "individual",
                  "to": contact.whatsapp_number,
                  "type": "interactive",
                  "interactive": {
                    "type": "list",
                    "body": {
                      "text": 'Você pode ser atendido em nossa clínica usando o seu plano Particular.\n \nCom qual destes profissionais você desejar marcar um consulta?\n \nEscolha uma das opções abaixo.'
                    },
                    "action": {
                      "button": "Abrir opções",
                      "sections": [
                        {
                          "title": "Opções disponíveis",
                          "rows": rows,
                        }
                      ]
                    }
                  }
                };

                const token = process.env.WHATSAPP_TOKEN;

                const url = `/${phone_number_id}/messages?access_token=${token}`;

                try {
                  await graphApi.post<ISendMessageData, AxiosResponse<ISendMessageData>>(url, data);
                } catch (err) {
                  console.log(err.message);
                }
              }
            } else if (openTicketByContact.stage === 'book_appointment_speciality_list') {
              await this.ticketsReposity.update(openTicketByContact.id, "book_appointment_speciality_option", 1);

              const tickets = await this.ticketsReposity.list();

              console.log(tickets);

              if (message === 'btn_book_appointment_unimed_plan') {
                const data = {
                  "messaging_product": "whatsapp",
                  "recipient_type": "individual",
                  "to": contact.whatsapp_number,
                  "type": "interactive",
                  "interactive": {
                    "type": "list",
                    "body": {
                      "text": 'Você pode ser atendido em nossa clínica usando o seu plano Unimed.\n \nCom qual destes profissionais você desejar marcar um consulta?\n \nEscolha uma das opções abaixo.'
                    },
                    "action": {
                      "button": "Abrir opções",
                      "sections": [
                        {
                          "title": "Opções disponíveis",
                          "rows": [
                            {
                              "id": "btn_book_cardiolody",
                              "title": "Cargiologia",
                            },
                            {
                              "id": "btn_book_gp",
                              "title": "Clínica Médica (Clínico Geral)",

                            },
                            {
                              "id": "btn_book_dermatology",
                              "title": "Dermatologia",
                            },
                            {
                              "id": "btn_book_nutrition",
                              "title": "Nutrição",
                            },
                            {
                              "id": "btn_book_pediatrics",
                              "title": "Pediatria",
                            },
                            {
                              "id": "btn_book_psychology",
                              "title": "Psicologia",
                            },
                            {
                              "id": "btn_book_psychiatrist",
                              "title": "Psiquiatria",
                            },
                            {
                              "id": "btn_back_to_the_start",
                              "title": "Voltar ao ínicio",
                            }
                          ]
                        }
                      ]
                    }
                  }
                };

                const token = process.env.WHATSAPP_TOKEN;

                const url = `/${phone_number_id}/messages?access_token=${token}`;

                try {
                  await graphApi.post<ISendMessageData, AxiosResponse<ISendMessageData>>(url, data);
                } catch (err) {
                  console.log(err.message);
                }
              } else if (message === 'btn_book_appointment_porto_seguro_plan') {
                const data = {
                  "messaging_product": "whatsapp",
                  "recipient_type": "individual",
                  "to": contact.whatsapp_number,
                  "type": "interactive",
                  "interactive": {
                    "type": "list",
                    "body": {
                      "text": 'Você pode ser atendido em nossa clínica usando o seu plano Porto Seguro Saúde.\n \nCom qual destes profissionais você desejar marcar um consulta?\n \nEscolha uma das opções abaixo.'
                    },
                    "action": {
                      "button": "Abrir opções",
                      "sections": [
                        {
                          "title": "Opções disponíveis",
                          "rows": [
                            {
                              "id": "btn_book_cardiolody",
                              "title": "Cargiologia",
                            },
                            {
                              "id": "btn_book_gp",
                              "title": "Clínica Médica (Clínico Geral)",

                            },
                            {
                              "id": "btn_book_dermatology",
                              "title": "Dermatologia",
                            },
                            {
                              "id": "btn_book_nutrition",
                              "title": "Nutrição",
                            },
                            {
                              "id": "btn_book_pediatrics",
                              "title": "Pediatria",
                            },
                            {
                              "id": "btn_book_psychology",
                              "title": "Psicologia",
                            },
                            {
                              "id": "btn_book_psychiatrist",
                              "title": "Psiquiatria",
                            },
                            {
                              "id": "btn_back_to_the_start",
                              "title": "Voltar ao ínicio",
                            }
                          ]
                        }
                      ]
                    }
                  }
                };

                const token = process.env.WHATSAPP_TOKEN;

                const url = `/${phone_number_id}/messages?access_token=${token}`;

                try {
                  await graphApi.post<ISendMessageData, AxiosResponse<ISendMessageData>>(url, data);
                } catch (err) {
                  console.log(err.message);
                }
              } else if (message === 'btn_book_appointment_particular_plan') {
                const data = {
                  "messaging_product": "whatsapp",
                  "recipient_type": "individual",
                  "to": contact.whatsapp_number,
                  "type": "interactive",
                  "interactive": {
                    "type": "list",
                    "body": {
                      "text": 'Você pode ser atendido em nossa clínica usando o seu plano Particular.\n \nCom qual destes profissionais você desejar marcar um consulta?\n \nEscolha uma das opções abaixo.'
                    },
                    "action": {
                      "button": "Abrir opções",
                      "sections": [
                        {
                          "title": "Opções disponíveis",
                          "rows": [
                            {
                              "id": "btn_book_cardiolody",
                              "title": "Cargiologia",
                            },
                            {
                              "id": "btn_book_gp",
                              "title": "Clínica Médica (Clínico Geral)",

                            },
                            {
                              "id": "btn_book_dermatology",
                              "title": "Dermatologia",
                            },
                            {
                              "id": "btn_book_nutrition",
                              "title": "Nutrição",
                            },
                            {
                              "id": "btn_book_pediatrics",
                              "title": "Pediatria",
                            },
                            {
                              "id": "btn_book_psychology",
                              "title": "Psicologia",
                            },
                            {
                              "id": "btn_book_psychiatrist",
                              "title": "Psiquiatria",
                            },
                            {
                              "id": "btn_back_to_the_start",
                              "title": "Voltar ao ínicio",
                            }
                          ]
                        }
                      ]
                    }
                  }
                };

                const token = process.env.WHATSAPP_TOKEN;

                const url = `/${phone_number_id}/messages?access_token=${token}`;

                try {
                  await graphApi.post<ISendMessageData, AxiosResponse<ISendMessageData>>(url, data);
                } catch (err) {
                  console.log(err.message);
                }
              }
            } else if (openTicketByContact.stage === 'book_appointment_speciality_option') {
              await this.ticketsReposity.update(openTicketByContact.id, "book_appointment_speciality_day", 1);

              const data = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": contact.whatsapp_number,
                "type": "interactive",
                "interactive": {
                  "type": "list",
                  "body": {
                    "text": 'Por favor selecione um dia disponível para fazer o agendamento em abril de 2024.\n \n'
                  },
                  "action": {
                    "button": "Abrir opções",
                    "sections": [
                      {
                        "title": "Opções disponíveis",
                        "rows": [
                          {
                            "id": "btn_book_day_08_04_2024",
                            "title": "08/04 (Segunda)",
                          },
                          {
                            "id": "btn_book_day_09_04_2024",
                            "title": "09/04 (Terça)",
                          },
                          {
                            "id": "btn_book_day_11_04_2024",
                            "title": "11/04 (Quinta)",
                          },
                          {
                            "id": "btn_book_day_13_04_2024",
                            "title": "13/04 (Sexta)",
                          },
                          {
                            "id": "btn_back_to_the_start",
                            "title": "Voltar ao ínicio",
                          }
                        ]
                      }
                    ]
                  }
                }
              };

              const token = process.env.WHATSAPP_TOKEN;

              const url = `/${phone_number_id}/messages?access_token=${token}`;

              try {
                await graphApi.post<ISendMessageData, AxiosResponse<ISendMessageData>>(url, data);
              } catch (err) {
                console.log(err.message);
              }
            } else if (openTicketByContact.stage === 'book_appointment_speciality_day') {
              await this.ticketsReposity.update(openTicketByContact.id, "book_appointment_speciality_hour", 1);

              const data = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": contact.whatsapp_number,
                "type": "interactive",
                "interactive": {
                  "type": "list",
                  "body": {
                    "text": 'Perfeito, ainda estamos com alguns horários disponíveis nesse dia.\n \nQue horas do dia você deseja agendar?\n \nEscolha uma opção abaixo.'
                  },
                  "action": {
                    "button": "Abrir opções",
                    "sections": [
                      {
                        "title": "Opções disponíveis",
                        "rows": [
                          {
                            "id": "btn_book_hour_09_00",
                            "title": "09:00",
                          },
                          {
                            "id": "btn_book_hour_11_00",
                            "title": "11:00",
                          },
                          {
                            "id": "btn_book_hour_13_00",
                            "title": "13:00",
                          },
                          {
                            "id": "btn_book_hour_15_00",
                            "title": "15:00",
                          },
                          {
                            "id": "btn_back_to_the_start",
                            "title": "Voltar ao ínicio",
                          }
                        ]
                      }
                    ]
                  }
                }
              };

              const token = process.env.WHATSAPP_TOKEN;

              const url = `/${phone_number_id}/messages?access_token=${token}`;

              try {
                await graphApi.post<ISendMessageData, AxiosResponse<ISendMessageData>>(url, data);
              } catch (err) {
                console.log(err.message);
              }
            } else if (openTicketByContact.stage === 'book_appointment_speciality_hour') {
              await this.ticketsReposity.update(openTicketByContact.id, "book_appointment_flow_end", 2);

              const data: ISendMessageData = {
                messaging_product: "whatsapp",
                to: contact.whatsapp_number,
                text: {
                  body: 'Agendamento realizado com sucesso!\n \nCaso precise remarcar ou desmarcar consulta, pedimos entre em contato com no minimo 24h de atecedência.\n \nObrigado por usar nossos serviços.'
                },
              };

              const token = process.env.WHATSAPP_TOKEN;

              const url = `/${phone_number_id}/messages?access_token=${token}`;

              try {
                await graphApi.post<ISendMessageData, AxiosResponse<ISendMessageData>>(url, data);
              } catch (err) {
                console.log(err.message);
              }
            }
          }
        }
      } else {
        console.log('Here...');

        await this.ticketsReposity.create({
          stage: 'initial_list_menu',
          status: 1,
          contact_id: contact.id
        });

        const data = {
          "messaging_product": "whatsapp",
          "recipient_type": "individual",
          "to": contact.whatsapp_number,
          "type": "interactive",
          "interactive": {
            "type": "list",
            "body": {
              "text": `Olá, é um prazer te atender. Seja bem-vindo(a)! 😄\n \nOi, ${contact.name}! Eu sou a Lily, Assistente Virtual da Clínica Vida Plena.\n \nPor favor, selecione um dos botões abaixo para iniciar seu atendimento. 👇`
            },
            "action": {
              "button": "Abrir opções",
              "sections": [
                {
                  "title": "Opções disponíveis",
                  "rows": [
                    {
                      "id": "btn_book_appointment",
                      "title": "Marcar consulta",

                    },
                    {
                      "id": "btn_faq",
                      "title": "Tirar dúvidas",
                    },
                    {
                      "id": "btn_service_agent",
                      "title": "Falar com atendente",
                    }
                  ]
                }
              ]
            }
          }
        };

        const token = process.env.WHATSAPP_TOKEN;

        const url = `/${phone_number_id}/messages?access_token=${token}`;

        try {
          await graphApi.post<ISendMessageData, AxiosResponse<ISendMessageData>>(url, data);
        } catch (err) {
          console.log(err.message);
        }
      }
    }
  }
}

export { ReceiveMessageWebhookEventUseCase };