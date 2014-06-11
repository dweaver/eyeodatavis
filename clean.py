from pprint import pprint
import csv
import json
# build up {<county fips>: {<fish name>:count}}

# for now, {<fish name>:count}
def countyFull(county):
    return county + " County"

fipsByCounty = {}
fishTypes = set([])
fom = {}
with open('Census2010RaceCounty.csv', 'rb') as csvfile:
    reader = csv.reader(csvfile)
    idx = 0
    for row in reader:
        idx += 1
        fips, county = row[0], row[1]
        fipsByCounty[county] = fips

with open('fom-since2000.csv', 'rb') as csvfile:
    reader = csv.reader(csvfile)
    idx = 0
    for row in reader:
        idx += 1
        if idx == 1:
            continue
        #print(row[46])
        county, common, lake, catch = row[22], row[2].lower(), row[12].lower(), int(row[46])
        fishTypes.add(common)
        if countyFull(county) not in fipsByCounty:
            print("unknown county in fish data: " + county)
            continue
        #print fips + ',' + common + ',' + lake
        if county not in fom:
            fom[county] = {}
        if common not in fom[county]:
            fom[county][common] = 0
        fom[county][common] += catch

fishTypes = list(fishTypes)
#pprint(len(fishTypes))
print(json.dumps(fishTypes))
#pprint(fom)

with open('FishData.csv', 'wb') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(['County', 'fips'] + fishTypes)
    for county in fom:
        writer.writerow([county, fipsByCounty[countyFull(county)]] + [fom[county][ft] if ft in fom[county] else 0 for ft in fishTypes])
