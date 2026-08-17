#!/usr/bin/env bash
set -euo pipefail

target="node_modules/@trunqkj3n/kaguya/src/listenMqtt.js"

if ! grep -q "mqtt_closed_before_connect" "$target"; then
  sed -i "/mqttClient.on('connect', function () {/i\\	let shadowMqttConnected = false;" "$target"
  sed -i "/mqttClient.on('connect', function () {/a\\		shadowMqttConnected = true;" "$target"
  sed -i "/mqttClient.on('close', function () {/a\\		if (!shadowMqttConnected) { globalCallback({ type: 'mqtt_closed_before_connect', error: 'WebSocket closed before MQTT connection.' }, null); }" "$target"
fi

node --check "$target"
echo "MQTT close diagnostic is ready."
