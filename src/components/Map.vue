<script setup>
import { ref, shallowRef, watch } from "vue";
import {
    useProviceGeoJson,
    useCityGeoJson,
    useDistrictGeoJson,
    useDownloadGeojson,
    useDistrictSearch,
} from "../utils/map";
const form = ref({
    countryCode: 100000,
    provinceCode: 110000,
    cityCode: 110101,
});
const provinceGeoJson = shallowRef(null);
const cityGeoJson = shallowRef(null);
const districtGeoJson = shallowRef(null);
const cityDownLoad = ref(true);
const counName = ref("");
const pName = ref("");
const cName = ref("");

const { province, counterName } = await useProviceGeoJson(form.value.countryCode);
provinceGeoJson.value = province.value;
counName.value = counterName.value;

const { city, provinceName } = await useCityGeoJson(form.value.provinceCode);
cityGeoJson.value = city.value;
pName.value = provinceName.value;

const { district, cityName } = await useDistrictGeoJson(form.value.cityCode);
districtGeoJson.value = district.value;
cName.value = cityName.value;

const provinceChange = async (val) => {
    form.value.cityCode = "";
    districtGeoJson.value = null;
    const { city, provinceName } = await useCityGeoJson(val);

    cityGeoJson.value = city.value;
    pName.value = provinceName.value;
};
const cityChange = async (val) => {
    const { district, cityName } = await useDistrictGeoJson(val);
    districtGeoJson.value = district.value;
    cName.value = cityName.value;
};

watch(districtGeoJson, (newv) => {
    console.log("new", newv);
    if (newv?.geoJson.features.length > 0) {
        cityDownLoad.value = false;
    } else {
        cityDownLoad.value = true;
    }
});
</script>
<template>
    <div class="con">
        <div class="content">
            <h1>全国地图GeoJson数据下载</h1>
            <el-form :model="form">
                <el-form-item label="国家">
                    <el-select v-model="form.countryCode" class="m-2" placeholder="选择国家">
                        <el-option label="中国" :value="form.countryCode" />
                    </el-select>
                    <el-button
                        class="btn"
                        type="primary"
                        @click="useDownloadGeojson(provinceGeoJson, counName)"
                        >下载全国所有省份的GeoJson</el-button
                    >
                </el-form-item>
                <el-form-item label="省：">
                    <el-select
                        v-model="form.provinceCode"
                        class="m-2"
                        placeholder="选择省份"
                        @change="provinceChange"
                    >
                        <el-option
                            v-for="item in provinceGeoJson.geoJson.features"
                            :key="item.properties?.name"
                            :label="item.properties?.name"
                            :value="item.properties?.adcode"
                        />
                    </el-select>
                    <el-button
                        class="btn"
                        type="primary"
                        @click="useDownloadGeojson(cityGeoJson, pName)"
                        >下载省份所有市区的GeoJson</el-button
                    >
                </el-form-item>
                <el-form-item label="市：">
                    <el-select
                        v-model="form.cityCode"
                        class="m-2"
                        placeholder="选择市"
                        @change="cityChange"
                    >
                        <el-option
                            v-for="item in cityGeoJson.geoJson.features"
                            :key="item.properties?.adcode"
                            :label="item.properties?.name"
                            :value="item.properties?.adcode"
                        />
                    </el-select>
                    <el-button
                        class="btn"
                        type="primary"
                        :disabled="cityDownLoad"
                        @click="useDownloadGeojson(districtGeoJson, cName)"
                        >下载市区所有县的GeoJson</el-button
                    >
                </el-form-item>
            </el-form>
            <el-card class="box-card">
                <p>下载文件包含两个属性，geoJson：地区的geoJson数据，info：地区相关信息</p>
            </el-card>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.con {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    h1 {
        margin-bottom: 60px;
    }
    .content {
        .btn {
            margin: 0 20px;
        }
        .box-card {
            margin-top: 50px;
        }
    }
}
</style>
