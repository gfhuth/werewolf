# coding=utf-8

import subprocess
import sys

NBERR=0 #on compte le nombre d'erreurs
NBWARN=0 #et de warnings
color="green" #le badge est par défaut vert

NBDIAGRAMS=subprocess.run("ls documentation/client/ | egrep \"*drawio\" | wc -l", shell=True, check=True, text=True)
NBDIAGRAMSGENERE=subprocess.run("ls documentation/client/out | wc -l", shell=True, check=True, text=True)

#On regarde s'il y a une difference
if NBDIAGRAMS == NBDIAGRAMSGENERE:
    NBWARN = 0
else:
    NBERR = 1

if NBERR > 0:
    color = "red"
elif NBWARN > 0:
    color = "orange"


#on appelle anybadge pour faire un badge .svg
args = f"anybadge -o -l \"Drawio\" -v \"{NBERR} erreur {NBWARN} warning\" -c \"{color}\" -f \"drawio.svg\"
subprocess.run(args, shell=True, check=True)

 
