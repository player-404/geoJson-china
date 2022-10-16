<script setup>
import Map from "./components/Map.vue";
</script>
<template>
    <Suspense>
        <Map></Map>
        <template #fallback>loading...</template>
    </Suspense>
</template>
<style lang="scss" scoped></style>
