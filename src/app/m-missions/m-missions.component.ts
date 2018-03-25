import { Component, OnInit } from '@angular/core';
import { Mission } from '../model/mission';
import { Departement } from '../model/departement';
import { MissionService } from '../model/mission.service';
import { ThemeService } from '../model/theme.service';
import { Theme } from '../model/theme';
import {RlTagInputModule} from 'angular2-tag-input';
import { MotCleService } from '../model/motcle.service';
import { MotCle } from '../model/motcle';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { OrdreMission } from '../model/ordremission';
import { Missionaire } from '../model/missionaire';
import { MissionaireServices } from '../model/missionaire.service';
import { OrdreMissionService } from '../model/ordremission.service';
import { MFraisdestComponent } from "../m-fraisdest/m-fraisdest.component";
@Component({
  selector: 'app-m-missions',
  templateUrl: './m-missions.component.html',
  styleUrls: ['./m-missions.component.css']
})
export class MMissionsComponent implements OnInit {
  add:boolean = true;
  list:boolean = true;
  addMiss:boolean = false;
  editMiss:boolean = false;
  mission:Mission;
  modal:boolean = false;
  codeMission:string = '';
  departement:Departement = new Departement();
  searchString:string;
  duree:number = 0;
  duree2:number = 0;
  d:Date = new Date();
  year : number = this.d.getFullYear();
  y:string = this.year.toString().substr(2,2);
  themes:Theme[] = [];
  motcles:MotCle[]= [];
  choosenMc:MotCle = new MotCle();
  codeMissPartial:string;
  inserted : boolean = false;
  missions:Mission[] = [];
  missionaires:OrdreMission[] = [];
  n:string = '';
  missionairesAff:Missionaire[] = [];
  ordre:OrdreMission = new OrdreMission();
  missionaire:Missionaire = new Missionaire();
  part1:boolean = true; // add mission
  part2:boolean = true; // add direction

  // ordre mission pour depenses part 2
  ordremiss:OrdreMission = new OrdreMission();
  missionconcerne:Mission = new Mission();
  constructor(public mserv:MissionService,public thServ:ThemeService,
    public mocserv:MotCleService,public router:Router,public miserv:MissionaireServices,public ordm:OrdreMissionService) { 
    this.mission = new Mission();
    this.departement = JSON.parse(localStorage.getItem('org'));
    this.reloadCode();
    mserv.getAllMissionsOfDep(this.departement.codeDep).subscribe(mi=>this.missions = mi);
    mocserv.getAllMC().subscribe(mc=>this.motcles = mc);   
  }
  ngOnInit() { 
    this.missionaire.idMissionaire = 1;
    this.miserv.getAllMissionaire(this.departement.codeDep).subscribe(d=>{
      this.missionairesAff = d;     
    });
     }
    calculDuree(){
        if(new Date(this.mission.dateDepartP).getTime() > new Date(this.mission.dateArriveP).getTime() )
        {
          alert("تاريخ الذهاب يجب ان يكون اقل من تاريخ الإياب");}
          else  if(this.mission.dateArriveP!=undefined && this.mission.dateDepartP !=undefined && this.duree >=0){
          let date1 = new Date(this.mission.dateArriveP).getTime();
          let date2 = new Date(this.mission.dateDepartP).getTime();
          var diff = Math.abs(date2 - date1);
          this.duree = Math.ceil(diff / (1000 * 3600 * 24));
          this.duree2 = this.duree;
        }
        else { this.duree = 0;
          this.duree2 = this.duree;}
        this.ordre.mission.dateDepartP = this.mission.dateDepartP;
        this.ordre.mission.dateArriveP = this.mission.dateArriveP;
      }
 
  toggleAdd(){
    this.add = !this.add;
  }
  toggleList(){
    this.list = !this.list;
  }
  fetchTheme(){
    this.thServ.getTheme(this.choosenMc.theme.idtheme).subscribe(r=>this.mission.theme = r);
    this.mission.objectifMissionAr = this.choosenMc.libMcAr;
    this.mission.objectifMissionFr = this.choosenMc.libMcFr;
  }
  toggleModal(){
    this.modal = !this.modal;
  }
  reloadCode(){
    this.mserv.getLatestMissionCode(this.departement.codeDep).subscribe((d)=>{
      if(d==null || d== undefined || d.length == 0){
        this.codeMission = this.departement.codeDep + "/" + this.y + "0001";
        this.codeMissPartial =  this.y + "0001";
      }
      else {
        this.codeMission = this.departement.codeDep + "/" + (Number(d)+1);
         this.codeMissPartial =  (Number(d)+1)+"";
      }
    });
  }
 
    disp(){
    this.ordre.mission = this.mission;
    this.ordre.dateDepP = this.mission.dateDepartP;
    this.ordre.dateArrP = this.mission.dateArriveP;
    this.miserv.getMissionaireByCin(Number(this.n.substr(this.n.indexOf(":")+2,8)))
    .subscribe(d=>this.ordre.missionaire = d);
    }
    addMissionaireToOrd(){
      this.addMiss = true;
      this.editMiss = false;
      this.toggleModal();
    }
    addMissionaire(){
      if(this.missionaires.length==0){
        this.ordre.numOrdre = 1;

        this.ordre.mission.numMission = Number(this.codeMissPartial);
        
        this.ordm.insertOrdMission(this.ordre).then(x=>{
          x.dateArrP = this.ordre.dateArrP;
          x.dateDepP = this.ordre.dateDepP;
          this.missionaires.push(x);      
          const index:number = this.missionairesAff.indexOf(this.ordre.missionaire);
              if(index!==-1){
                this.n='';
                this.missionairesAff.splice(index,1);
                this.ordre = new OrdreMission();
              }
        });
        this.toggleModal();
      }
      else {
        this.ordm.getLatestORDMISS(Number(this.codeMissPartial)).subscribe(
          x=>{
            this.ordre.numOrdre = Number(x)+1;
            this.ordre.mission.numMission = Number(this.codeMissPartial);
           
            this.ordm.insertOrdMission(this.ordre).then(x=>{
              x.dateArrP = this.ordre.dateArrP;
              x.dateDepP = this.ordre.dateDepP;
              this.missionaires.push(x);  
              const index:number = this.missionairesAff.indexOf(this.ordre.missionaire);
              if(index!==-1){
                this.n='';
                this.missionairesAff.splice(index,1);
                this.ordre = new OrdreMission();
              }
            });

            this.toggleModal();
          }
        )
      }
    
    }
    numordConv(n:number):string{
      if(n<10) return "0"+n;
    }

  onSubmit(f:NgForm){
    this.mission.departement = this.departement;
    this.mission.numMission = Number(this.codeMissPartial);
    this.mserv.insertMission(this.mission).then(()=>null);
    alert("تم إضافة المأمورية");
    this.inserted = true;
    }


  convDur(){
    if(this.ordre.dateDepP!=undefined && this.ordre.dateArrP!=undefined){
        if (this.ordre.dateDepP==this.ordre.dateArrP) this.duree2 =  0;
        else {
          let diff =  Math.abs(new Date(this.ordre.dateArrP).getTime() - new Date(this.ordre.dateDepP).getTime());
            this.duree2 =  Math.ceil(diff / (1000 * 3600 * 24));
          }
    }
    else this.duree2 = 0;
  }
  editord(m:OrdreMission){
    this.addMiss = false;
    this.editMiss = true;
    this.ordre = m;
    this.n =   m.missionaire.cin +" : "+ m.missionaire.nomAr +" "+ m.missionaire.prenomAr;
    this.toggleModal();
  }
  editMissionaire(){
    this.ordm.updateOrdMission(this.ordre).subscribe(x=>null);
    alert("done");
  }

  getBack(){
    this.part2 = false;
    this.part1 = true;
  }

  // pt 2 

  redirectDepenses(u:OrdreMission){
    this.ordremiss= u;
    this.mission = u.mission;
    this.part1 = false;
    this.part2 = true;
  }
}