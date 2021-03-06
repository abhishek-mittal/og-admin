import {OnInit, Component, AfterViewInit, Input} from '@angular/core';
import {AdminService} from './../../../../../shared/services/admin.service';
import {Datatable} from "../../../../../shared/interfaces/datatable.interface";
import {Script} from "../../../../../shared/services/script.service";
import {ActivatedRoute} from "@angular/router";
import {JSONCompare} from "../../../../../shared/services/helper-service/json-compare";


declare var jQuery: any;
declare var moment: any;
declare var google: any;

@Component({
  selector: 'company-log',
  templateUrl: './companylog.component.html',
  styleUrls: ['./companylog.css']
})
export class CompanylogComponent extends Datatable implements OnInit, AfterViewInit{
  @Input() company: any;
  subAdminId: String;
  loading: boolean = false;
  subAdminLogs: any = [];
  beforeChange: any = '';
  afterChange: any = '';
  user: any = '';
  log: any = '';
  comp: any = {};
  logLoading :boolean = false;
  constructor(private _adminService: AdminService,
              private _script: Script,
              private route: ActivatedRoute,private _JSONCompare: JSONCompare) {
    super();
    this.route.params.subscribe(params => {
      this.subAdminId = params['id'];
    });
  }

  ngOnInit() {
  }

  ngAfterViewInit() {

    this._script.load('datatables')
      .then((data) => {
        this.getCompanyLogs();
      })
      .catch((error) => {
        console.log('Script not loaded', error);
      });

    // jQuery('.modal').on('hidden.bs.modal', function () {
    //   this.error = false;
    //   this.errorMessage = '';
    // });
  }

  getCompanyLogs(){
    let obj = {
      limit: this.current_limit,
      page: this.current_page - 1,
      searchKey: this.search
    };
    let self  = this;
    self.subAdminLogs = [];
    self.loading = true;
    let getAllAdminLogs = self._adminService.getAllAdminLogs(this.company.id, obj)
      .subscribe(
        (success: any) => {

          self.subAdminLogs = success.log;
          console.log(this.subAdminLogs);
          this.total_pages = Math.ceil(success.count / this.current_limit);
          self.loading = false;
        },
        (error: any) => {
          console.log('subadminlog e', error);
        }
      );
  }

  paging(num: number) {
    super.paging(num);
    this.getCompanyLogs();
  }

  limitChange(event: any) {
    super.limitChange(event);
    this.getCompanyLogs();
  }

  previous() {
    super.previous();
    this.getCompanyLogs();
  }

  next() {
    super.next();
    this.getCompanyLogs();
  }

  searchData() {
    super.searchData();
    this.getCompanyLogs();
  }
  dateFormat(date: any) {
    let d = new Date(date);
    return d.toString().split('GMT')[0];
  }
  getLogById(logId){
    let self = this;
    let success = this.subAdminLogs[logId];
    this.log = success;
    if(success.user){
      this.user = success.user.emails[0].email;
    }
    else{
      this.user = 'Chargbee Admin';
    }
    
    this.beforeChange = JSON.parse(success.before_change);
    this.afterChange = JSON.parse(success.after_change);
    var t0 = performance.now();
    this._JSONCompare.compareJson(this.beforeChange,this.afterChange);
    this.beforeChange = Object.keys(this.beforeChange).reduce((acc,key)=>{
      return acc+this.beforeChange[key];
    },'')//.replace(/<\/td>/g,'</td><br/>'); 
    this.afterChange = Object.keys(this.afterChange).reduce((acc,key)=>{
      return acc+this.afterChange[key];
    },'')//.replace(/<\/td>/g,'</td><br/>');
    var t1 = performance.now();

  }
  generateKeys(obj){
      return Object.keys(obj);
  }


}
