// ===============================
// COMPREHENSIVE ELECTRICITY DATA
// ===============================

import { parseElectricityData } from '../utils/electricity-db';

// Raw data string with new comprehensive structure including Municipality Unit Numbers
export const rawElectricityDataString = `SL:no.	Zone	Type	Muscat Bay Number	Unit Number (Municipality)	Electrical Meter Account No	November-24	December-24	January-25	February-25	March-25	April-25
1	Infrastructure	MC	MC	Pumping Station 01	R52330	1629	1640	1903	2095	3032	3940
2	Infrastructure	MC	MC	Pumping Station 03	R52329	0	179	32.5	137.2	130.7	276.6
3	Infrastructure	MC	MC	Pumping Station 04	R52327	919	921	245.1	869.5	646.1	984.9
4	Infrastructure	MC	MC	Pumping Station 05	R52325	2599	1952	2069	2521	2601	3317
5	Infrastructure	MC	MC	Lifting Station 02	R52328	0	0	0	0	0	0
6	Infrastructure	MC	MC	Lifting Station 03	R52333	91	185	28	40	58	83
7	Infrastructure	MC	MC	Lifting Station 04	R52324	686	631	701	638	572	750.22
8	Infrastructure	MC	MC	Lifting Station 05	R52332	2413	2643	2873	3665	3069	4201.4
9	Infrastructure	MC	MC	Irrigation Tank 01	R52324 (R52326)	1432	1268	1689	2214	1718	1663
10	Infrastructure	MC	MC	Irrigation Tank 02	R52331	974	1026	983	1124	1110	1830
11	Infrastructure	MC	MC	Irrigation Tank 03	R52323	269	417	840	1009	845	1205
12	Infrastructure	MC	MC	Irrigation Tank 04	R53195	212	213	39.7	233.2	234.9	447.2
13	Infrastructure	MC	MC	Actuator DB 01 (Z8)	R53196	34	29	7.3	27.7	24.4	27.1
14	Infrastructure	MC	MC	Actuator DB 02	R51900	232	161	33	134	138.5	211
15	Infrastructure	MC	MC	Actuator DB 03	R51904	220	199	55.7	203.3	196	211.6
16	Infrastructure	MC	MC	Actuator DB 04	R51901	172	173	186	161	227	253
17	Infrastructure	MC	MC	Actuator DB 05	R51907	18	16	4.2	17.8	14	17.7
18	Infrastructure	MC	MC	Actuator DB 06	R51909	49	44	47	45	38	46.9
19	Infrastructure	MC	MC	Street Light FP 01 (Z8)	R53197	3593	3147	787	3228	2663	3230
20	Infrastructure	MC	MC	Street Light FP 02	R51906	2361	2258	633	2298	1812	2153
21	Infrastructure	MC	MC	Street Light FP 03	R51905	2060	1966	1868	1974	1562	1847
22	Infrastructure	MC	MC	Street Light FP 04	R51908	2299	1389	325	1406	1401	2412.9
23	Infrastructure	MC	MC	Street Light FP 05	R51902	1477	1121	449	2069.9	1870.1	3233
24	Infrastructure	MC	MC	Beachwell	R51903	24383	37236	38168	18422	40	27749
25	Infrastructure	MC	MC	Helipad	R52334	0	0	0	0	0	0
26	Central Park	MC	MC	Central Park	R54672	9604	19032	22819	19974	14190	13846
27	Ancillary	Building	MC	Guard House	R53651	1225	814	798	936	879	1467
28	Ancillary	Building	MC	Security Building	R53649	5702	5131	5559	5417	4504	5978
29	Ancillary	Building	MC	ROP Building	R53648	3581	2352	2090	2246	1939	3537
30	Zone 3	SBJ Common Meter	D 44	Apartment	R53705	1377	764	647	657	650	1306
31	Zone 3	SBJ Common Meter	D 45	Apartment	R53665	1252	841	670	556	608	1069
32	Zone 3	SBJ Common Meter	D 46	Apartment	R53700	1577	890	724	690	752	1292
33	Zone 3	SBJ Common Meter	D 47	Apartment	R53690	1774	1055	887	738	792	1545
34	Zone 3	SBJ Common Meter	D 48	Apartment	R53666	1046	785	826	676	683	1092
35	Zone 3	SBJ Common Meter	D 49	Apartment	R53715	1608	1068	860	837	818	984
36	Zone 3	SBJ Common Meter	D 50	Apartment	R53672	1102	789	765	785	707	1331
37	Zone 3	SBJ Common Meter	D 51	Apartment	R53657	1855	710	661	682	642	904
38	Zone 3	SBJ Common Meter	D 52	Apartment	R53699	1986	1208	979	896	952	1651
39	Zone 3	SBJ Common Meter	D53	Apartment	R54782	1764	968	693	732	760	1281
40	Zone 3	SBJ Common Meter	D54	Apartment	R54793	1777	834	681	559	531	1042
41	Zone 3	SBJ Common Meter	D55	Apartment	R54804	1828	1035	677	616	719	1417
42	Zone 3	SBJ Common Meter	D56	Apartment	R54815	1805	937	683	731	765	1536
43	Zone 3	SBJ Common Meter	D57	Apartment	R54826	2262	1332	990	846	795	1732
44	Zone 3	SBJ Common Meter	D58	Apartment	R54836	1534	778	593	535	594	1415
45	Zone 3	SBJ Common Meter	D59	Apartment	R54847	1634	998	628	582	697	1138
46	Zone 3	SBJ Common Meter	D60	Apartment	R54858	1275	705	674	612	679	1069
47	Zone 3	SBJ Common Meter	D61	Apartment	R54869	1734	977	767	800	719	1394
48	Zone 3	SBJ Common Meter	D 62	Apartment	R53717	1630	957	715	677	595	800
49	Zone 3	SBJ Common Meter	D 74	Apartment	R53675	1303	766	639	566	463	1079
50	Zone 3	SBJ Common Meter	D 75	Apartment	R53668	1169	702	475	508	554	912
51		SBJ Common Meter		Village Square	R56628	6229	3695	3304	3335	3383	4415
52	Zone 3	SBJ Common Meter	FP-17	Zone-3 landscape light	R54872	0	0	0	0	0	0
53	Zone 3	SBJ Common Meter	FP-21	Zone-3 landscape light	R54873	40	48	12.9	56.6	46.5	55
54	Zone 3	SBJ Common Meter	FP-22	Zone-3 landscape light	R54874	6	8	0	0	0	0
55		SBJ Common Meter		Bank muscat	MISSING_METER	148	72	59	98	88	163
56		SBJ Common Meter		CIF kitchen	MISSING_METER	16742	15554	16788	16154	14971	18446`.trim();

// Parse the raw data into structured electricity units
export const comprehensiveElectricityData = parseElectricityData(rawElectricityDataString);

// Extract available months from the data
export const availableMonths = Object.keys(comprehensiveElectricityData[0]?.consumption || {});

// Get unique categories for filtering
export const electricityCategories = [...new Set(comprehensiveElectricityData.map(unit => unit.category))].sort();

// Get unique zones for filtering
export const electricityZones = [...new Set(comprehensiveElectricityData.map(unit => unit.zone))].filter(zone => zone !== 'N/A').sort();

// Get unique types for filtering
export const electricityTypes = [...new Set(comprehensiveElectricityData.map(unit => unit.type))].filter(type => type !== 'N/A').sort();

// Calculate summary statistics
export const electricitySummary = {
  totalUnits: comprehensiveElectricityData.length,
  activeUnits: comprehensiveElectricityData.filter(unit => unit.isActive).length,
  totalConsumption: comprehensiveElectricityData.reduce((sum, unit) => sum + unit.totalConsumption, 0),
  averageConsumption: comprehensiveElectricityData.reduce((sum, unit) => sum + unit.totalConsumption, 0) / comprehensiveElectricityData.length,
  highestConsumer: comprehensiveElectricityData.reduce((max, unit) => unit.totalConsumption > max.totalConsumption ? unit : max, comprehensiveElectricityData[0]),
  lowestConsumer: comprehensiveElectricityData
    .filter(unit => unit.totalConsumption > 0)
    .reduce((min, unit) => unit.totalConsumption < min.totalConsumption ? unit : min, comprehensiveElectricityData[0]),
  categoryCounts: electricityCategories.reduce((acc, category) => {
    acc[category] = comprehensiveElectricityData.filter(unit => unit.category === category).length;
    return acc;
  }, {} as Record<string, number>),
  zoneCounts: electricityZones.reduce((acc, zone) => {
    acc[zone] = comprehensiveElectricityData.filter(unit => unit.zone === zone).length;
    return acc;
  }, {} as Record<string, number>)
};

// Export functions for data manipulation
export const getUnitsByCategory = (category: string) => {
  return comprehensiveElectricityData.filter(unit => unit.category === category);
};

export const getUnitsByZone = (zone: string) => {
  return comprehensiveElectricityData.filter(unit => unit.zone === zone);
};

export const getUnitsByType = (type: string) => {
  return comprehensiveElectricityData.filter(unit => unit.type === type);
};

export const getTopConsumers = (limit: number = 10) => {
  return comprehensiveElectricityData
    .filter(unit => unit.totalConsumption > 0)
    .sort((a, b) => b.totalConsumption - a.totalConsumption)
    .slice(0, limit);
};

export const getBottomConsumers = (limit: number = 10) => {
  return comprehensiveElectricityData
    .filter(unit => unit.totalConsumption > 0)
    .sort((a, b) => a.totalConsumption - b.totalConsumption)
    .slice(0, limit);
};

export const getUnitsWithMissingMeters = () => {
  return comprehensiveElectricityData.filter(unit => 
    unit.meterAccountNo === 'MISSING_METER' || 
    unit.meterAccountNo === 'N/A' || 
    !unit.meterAccountNo.trim()
  );
};

export const getInactiveUnits = () => {
  return comprehensiveElectricityData.filter(unit => 
    unit.totalConsumption === 0 || 
    Object.values(unit.consumption).every(consumption => consumption === 0)
  );
};

// Monthly consumption analysis
export const getMonthlyTotals = () => {
  return availableMonths.map(month => ({
    month,
    total: comprehensiveElectricityData.reduce((sum, unit) => sum + (unit.consumption[month] || 0), 0),
    unitCount: comprehensiveElectricityData.filter(unit => (unit.consumption[month] || 0) > 0).length,
    average: comprehensiveElectricityData.reduce((sum, unit) => sum + (unit.consumption[month] || 0), 0) / 
             comprehensiveElectricityData.filter(unit => (unit.consumption[month] || 0) > 0).length
  }));
};

// Category consumption analysis
export const getCategoryConsumption = () => {
  const totalConsumption = comprehensiveElectricityData.reduce((sum, unit) => sum + unit.totalConsumption, 0);
  
  return electricityCategories.map(category => {
    const categoryUnits = getUnitsByCategory(category);
    const categoryConsumption = categoryUnits.reduce((sum, unit) => sum + unit.totalConsumption, 0);
    
    return {
      category,
      unitCount: categoryUnits.length,
      totalConsumption: categoryConsumption,
      averageConsumption: categoryConsumption / categoryUnits.length,
      percentage: (categoryConsumption / totalConsumption) * 100,
      peakUnit: categoryUnits.reduce((max, unit) => unit.totalConsumption > max.totalConsumption ? unit : max, categoryUnits[0])
    };
  }).sort((a, b) => b.totalConsumption - a.totalConsumption);
};

// Zone consumption analysis
export const getZoneConsumption = () => {
  const totalConsumption = comprehensiveElectricityData.reduce((sum, unit) => sum + unit.totalConsumption, 0);
  
  return electricityZones.map(zone => {
    const zoneUnits = getUnitsByZone(zone);
    const zoneConsumption = zoneUnits.reduce((sum, unit) => sum + unit.totalConsumption, 0);
    const categories = [...new Set(zoneUnits.map(unit => unit.category))];
    
    return {
      zone,
      unitCount: zoneUnits.length,
      totalConsumption: zoneConsumption,
      averageConsumption: zoneConsumption / zoneUnits.length,
      percentage: (zoneConsumption / totalConsumption) * 100,
      categories,
      dominantCategory: categories.reduce((max, category) => {
        const categoryCount = zoneUnits.filter(unit => unit.category === category).length;
        const maxCount = zoneUnits.filter(unit => unit.category === max).length;
        return categoryCount > maxCount ? category : max;
      }, categories[0])
    };
  }).sort((a, b) => b.totalConsumption - a.totalConsumption);
};

// Export validation data for checking data integrity
export const dataValidation = {
  duplicateSerialNumbers: comprehensiveElectricityData
    .map(unit => unit.slNo)
    .filter((slNo, index, arr) => arr.indexOf(slNo) !== index),
  
  duplicateMeterAccounts: comprehensiveElectricityData
    .map(unit => unit.meterAccountNo)
    .filter((meter, index, arr) => arr.indexOf(meter) !== index && meter !== 'MISSING_METER' && meter !== 'N/A'),
  
  missingMeterAccounts: getUnitsWithMissingMeters().length,
  
  zeroConsumptionUnits: getInactiveUnits().length,
  
  incompleteData: comprehensiveElectricityData.filter(unit => 
    !unit.unitName || 
    !unit.zone || 
    !unit.type || 
    unit.unitName === 'N/A' || 
    unit.zone === 'N/A'
  ).length
};

// Export the main data as default
export default comprehensiveElectricityData;

// Also export the original parsed data for backward compatibility
export { comprehensiveElectricityData as initialElectricityData };
