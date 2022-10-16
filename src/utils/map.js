import { ref, shallowRef } from "vue";

export function searchDis(disInstance, city) {
    return new Promise((res, rej) => {
        disInstance.search(city, (status, result) => {
            if (status === "complete") {
                res(result.districtList[0]);
            } else {
                rej(status);
            }
        });
    });
}

export function initDistrictSearch(level, subdistrict) {
    return new Promise((res, rej) => {
        AMap.plugin("AMap.DistrictSearch", () => {
            const districtSearch = new AMap.DistrictSearch({
                // 关键字对应的行政区级别，country表示国家
                level,
                //  显示下级行政区级数，1表示返回下一级行政区
                subdistrict,
            });
            if (districtSearch) {
                res(districtSearch);
            } else {
                rej("DistrictSearch init fail");
            }
        });
    });
}

export async function useDistrictSearch() {
    const district = shallowRef(null);
    const districtSearch = await initDistrictSearch("country", 3);
    // 搜索所有省/直辖市信息
    district.value = await searchDis(districtSearch, "中国");
    return {
        district,
    };
}

// 获取相应地区的geoJson数据
export function useGetGeoJson(adcode) {
    return new Promise((res, rej) => {
        const data = shallowRef({});
        AMapUI.loadUI(["geo/DistrictExplorer"], function (DistrictExplorer) {
            let districtExplorer = new DistrictExplorer();
            districtExplorer.loadAreaNode(adcode, async function (error, areaNode) {
                if (error) {
                    rej(error);
                    console.error(error);
                    return;
                }
                data.value.geoJson = { features: areaNode.getSubFeatures() };
                const props = areaNode.getProps();
                data.value.info = {
                    name: props.name,
                    level: props.level,
                    adcode: props.adcode,
                };
                res(data.value);
            });
        });
    });
}

// 获取省级的geoJson
export async function useProviceGeoJson(adCode) {
    const province = shallowRef(null);
    const counterName = ref(undefined);
    const data = await useGetGeoJson(adCode);
    province.value = data;
    console.log("data", data);
    counterName.value = data.info.name;
    return {
        province,
        counterName,
    };
}

// 获取市级的geoJson
export async function useCityGeoJson(provinceCode) {
    const city = shallowRef(null);
    const provinceName = ref(undefined);
    const data = await useGetGeoJson(provinceCode);
    city.value = data;
    provinceName.value = data.info.name;
    return {
        city,
        provinceName,
    };
}

// 获取县级的geoJson
export async function useDistrictGeoJson(cityCode) {
    const district = shallowRef(null);
    const cityName = ref(undefined);
    const data = await useGetGeoJson(cityCode);
    district.value = data;
    cityName.value = data.info.name;
    return {
        district,
        cityName,
    };
}

export function useDownloadGeojson(data, name) {
    let a = document.createElement("a");
    const blob = new Blob([JSON.stringify(data)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const fileName = `${name}.json`;
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    //在资源下载完成后 清除 占用的缓存资源
    window.URL.revokeObjectURL(a.href);
    a.remove();
    a = null;
}
