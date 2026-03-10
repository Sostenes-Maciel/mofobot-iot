#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"
#include "nvs_flash.h"
#include "esp_netif.h"
#include "driver/gpio.h"
#include "driver/adc.h"
#include "mqtt_client.h"
#include "dht.h"
#include "wifi_manager.h"

// Definições de Tópicos MQTT corrigidas
#define MQTT_TOPIC_UMIDADE_ATUAL "sensor_mofo/umidadeatual"
#define MQTT_TOPIC_GASES_ATUAL "sensor_mofo/gasesatual"
#define MQTT_TOPIC_ALERTA_SITUACAO "sensor_mofo/alertasituacao"
// Tópicos para o script enviar os valores de limiar para o ESP32
#define MQTT_TOPIC_LIMIAR_UMIDADE "sensor_mofo/limiar_umidade"
#define MQTT_TOPIC_LIMIAR_GASES "sensor_mofo/limiar_gases"

// Definições dos sensores
static const dht_sensor_type_t sensor_type = DHT_TYPE_AM2301;
static const gpio_num_t dht_gpio = GPIO_NUM_33;
#define MQ135_ADC_PIN ADC1_CHANNEL_6

static const char *TAG = "MAIN";

// Handle do cliente MQTT (global)
esp_mqtt_client_handle_t client;

// Variáveis globais para os limiares
static float limiar_umidade = 60.0f;
static int limiar_gas = 350;

// NOVAS VARIÁVEIS para a lógica de verificação
#define CONSECUTIVE_READINGS_THRESHOLD 1
static int alerta_counter = 0;

// Manipulador de eventos MQTT corrigido
static void mqtt_event_handler(void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data) {
    ESP_LOGD(TAG, "Evento disparado");
    esp_mqtt_event_handle_t event = event_data;
    switch ((esp_mqtt_event_id_t)event_id) {
        case MQTT_EVENT_CONNECTED:
            ESP_LOGI(TAG, "Conectado ao broker MQTT.");
            esp_mqtt_client_subscribe(client, MQTT_TOPIC_LIMIAR_UMIDADE, 0);
            esp_mqtt_client_subscribe(client, MQTT_TOPIC_LIMIAR_GASES, 0);
            break;
        case MQTT_EVENT_DISCONNECTED:
            ESP_LOGI(TAG, "Desconectado do broker MQTT.");
            break;
        case MQTT_EVENT_DATA:
            if (strncmp(event->topic, MQTT_TOPIC_LIMIAR_UMIDADE, event->topic_len) == 0) {
                char data_str[10];
                snprintf(data_str, event->data_len + 1, "%s", event->data);
                limiar_umidade = atof(data_str);
                ESP_LOGI(TAG, "Novo limiar de umidade recebido: %.1f", limiar_umidade);
            } else if (strncmp(event->topic, MQTT_TOPIC_LIMIAR_GASES, event->topic_len) == 0) {
                char data_str[10];
                snprintf(data_str, event->data_len + 1, "%s", event->data);
                limiar_gas = atoi(data_str);
                ESP_LOGI(TAG, "Novo limiar de gás recebido: %d", limiar_gas);
            }
            break;
        case MQTT_EVENT_PUBLISHED:
            break;
        default:
            ESP_LOGI(TAG, "Outro evento: %d", event->event_id);
            break;
    }
}

// Tarefa principal que lê todos os sensores e publica mensagens
void sensor_analysis_task(void *pvParameter) {
    adc1_config_width(ADC_WIDTH_BIT_12);
    adc1_config_channel_atten(MQ135_ADC_PIN, ADC_ATTEN_DB_11);

    while (1) {
        int16_t umidade_raw, temperatura_raw;
        dht_read_data(sensor_type, dht_gpio, &umidade_raw, &temperatura_raw);
        float umidade = umidade_raw / 10.0f;
        int mq135_valor_analogico = adc1_get_raw(MQ135_ADC_PIN);
        
        char payload[256];
        char status_final[128];

        sprintf(payload, "{\"umidade\":%.1f}", umidade);
        esp_mqtt_client_publish(client, MQTT_TOPIC_UMIDADE_ATUAL, payload, 0, 1, 0);
        
        sprintf(payload, "{\"mq135_raw\":%d}", mq135_valor_analogico);
        esp_mqtt_client_publish(client, MQTT_TOPIC_GASES_ATUAL, payload, 0, 1, 0);

        // Lógica de contagem para evitar alarmes falsos
        if (umidade >= limiar_umidade && mq135_valor_analogico > limiar_gas) {
            // Apenas incrementa se o contador for menor que o limiar
            if (alerta_counter < CONSECUTIVE_READINGS_THRESHOLD) {
                alerta_counter++;
            }
            ESP_LOGI(TAG, "Condição de alerta detectada. Contador: %d/%d", alerta_counter, CONSECUTIVE_READINGS_THRESHOLD);
        } else {
            alerta_counter = 5;
        }

        // Publica o status final apenas se o contador atingir o limite
        if (alerta_counter >= CONSECUTIVE_READINGS_THRESHOLD) {
            strcpy(status_final, "Alerta de Mofo!");
        } else {
            strcpy(status_final, "Ambiente seguro!");
        }
        
        sprintf(payload, "{\"status\":\"%s\"}", status_final);
        esp_mqtt_client_publish(client, MQTT_TOPIC_ALERTA_SITUACAO, payload, 0, 1, 0);
        
        ESP_LOGI(TAG, "Mensagens publicadas. Status final: %s", status_final);

        vTaskDelay(pdMS_TO_TICKS(20000));
    }
}

void mqtt_app_start(void) {
    const esp_mqtt_client_config_t mqtt_cfg = {
        .broker.address.uri = "mqtt://test.mosquitto.org",
    };
    client = esp_mqtt_client_init(&mqtt_cfg);
    esp_mqtt_client_register_event(client, ESP_EVENT_ANY_ID, mqtt_event_handler, client);
    esp_mqtt_client_start(client);
}

void app_main(void) {
    ESP_ERROR_CHECK(nvs_flash_init());
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());

    wifi_init_sta();

    mqtt_app_start();

    xTaskCreate(&sensor_analysis_task, "sensor_analysis_task", 4096, NULL, 5, NULL);
}