// ===============================
// ELECTRICITY SYSTEM DATA
// ===============================

import { parseElectricityData } from '@/lib/utils';
import { ElectricityDataItem } from '@/lib/types';

// Raw electricity data from the provided dataset
export const rawElectricityDataString = `SL:no.	Zone	Type 	Muscat Bay Number	Unit Number (Muncipality) 	Electrical Meter Account  No	November-24	December-24	January-25	February-25	March-25	April-25
1	Infrastructure	MC	MC	Pumping Station 01 	R52330	1629	1640	1903	2095	3032	3940
2	Infrastructure	MC	MC	Pumping Station 03	R52329	0	179	32.5	137.2	130.7	276.6
3	Infrastructure	MC	MC	Pumping Station 04 	R52327	919	921	245.1	869.5	646.1	984.9
4	Infrastructure	MC	MC	Pumping Station 05 	R52325	2599	1952	2069	2521	2601	3317
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
27	Ancilary	Building	MC	Guard House	R53651	1225	814	798	936	879	1467
28	Ancilary	Building	MC	Security Building	R53649	5702	5131	5559	5417	4504	5978
29	Ancilary	Building	MC	ROP Building	R53648	3581	2352	2090	2246	1939	3537
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

// Parse the raw data into structured format
export const initialElectricityData: ElectricityDataItem[] = parseElectricityData(rawElectricityDataString);

// Extract available months from the data
export const availableMonths: string[] = initialElectricityData.length > 0 
  ? Object.keys(initialElectricityData[0].consumption) 
  : [];

// Extract distinct categories
export const distinctCategories: string[] = [
  ...new Set(initialElectricityData.map(d => d.category))
].sort();

// Extract distinct units for dropdown
export const distinctUnitsForDropdown = initialElectricityData
  .map(d => ({ 
    value: d.id.toString(), 
    label: `${d.unitName} (${d.meterAccountNo})`
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

// Sample data for charts and analytics
export const sampleWaterQualityData = [
  { parameter: 'pH Level', value: 7.2, unit: '', status: 'normal' as const, range: '6.5-8.5' },
  { parameter: 'Turbidity', value: 0.8, unit: 'NTU', status: 'good' as const, range: '<1.0' },
  { parameter: 'Chlorine', value: 0.5, unit: 'mg/L', status: 'normal' as const, range: '0.2-0.6' },
  { parameter: 'TDS', value: 245, unit: 'mg/L', status: 'normal' as const, range: '<500' },
];

export const sampleWaterFlowData = [
  { name: 'Jan', inflow: 1200, outflow: 1100, consumption: 100 },
  { name: 'Feb', inflow: 1350, outflow: 1200, consumption: 150 },
  { name: 'Mar', inflow: 1400, outflow: 1250, consumption: 150 },
  { name: 'Apr', inflow: 1500, outflow: 1300, consumption: 200 },
];

export const sampleTreatmentStages = [
  { name: 'Primary Treatment', efficiency: 85, status: 'operational' as const },
  { name: 'Secondary Treatment', efficiency: 92, status: 'operational' as const },
  { name: 'Tertiary Treatment', efficiency: 96, status: 'operational' as const },
  { name: 'Disinfection', efficiency: 99, status: 'operational' as const },
];

export const sampleDailyTreatmentData = [
  { name: 'Mon', inflow: 800, treated: 760, efficiency: 95 },
  { name: 'Tue', inflow: 850, treated: 810, efficiency: 95.3 },
  { name: 'Wed', inflow: 780, treated: 745, efficiency: 95.5 },
  { name: 'Thu', inflow: 820, treated: 785, efficiency: 95.7 },
  { name: 'Fri', inflow: 900, treated: 865, efficiency: 96.1 },
  { name: 'Sat', inflow: 750, treated: 720, efficiency: 96 },
  { name: 'Sun', inflow: 700, treated: 672, efficiency: 96 },
];

export const sampleContractors = [
  { name: 'ElectroTech Solutions', project: 'Electrical Maintenance', status: 'active' as const, completion: 75, deadline: '2025-06-15' },
  { name: 'AquaServ Ltd', project: 'Water System Upgrade', status: 'active' as const, completion: 60, deadline: '2025-07-30' },
  { name: 'GreenScape', project: 'Landscape Maintenance', status: 'completed' as const, completion: 100, deadline: '2025-05-20' },
  { name: 'SecureGuard', project: 'Security System Install', status: 'pending' as const, completion: 25, deadline: '2025-08-10' },
];

export const sampleProjectStatuses = [
  { name: 'Completed', value: 8, color: '#10B981' },
  { name: 'In Progress', value: 12, color: '#F59E0B' },
  { name: 'Pending', value: 3, color: '#EF4444' },
  { name: 'On Hold', value: 2, color: '#9370DB' },
];
