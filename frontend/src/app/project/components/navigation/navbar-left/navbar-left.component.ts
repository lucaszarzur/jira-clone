import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { SearchDrawerComponent } from '../../search/search-drawer/search-drawer.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AddIssueModalComponent } from '../../add-issue-modal/add-issue-modal.component';
import { AuthService } from '@trungk18/core/services/auth.service';

@Component({
  selector: 'app-navbar-left',
  templateUrl: './navbar-left.component.html',
  styleUrls: ['./navbar-left.component.scss']
})
export class NavbarLeftComponent implements OnInit {
  items: NavItem[];
  bottomItems: NavItem[];

  constructor(
    private _drawerService: NzDrawerService,
    private _modalService: NzModalService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.items = [
      new NavItem('search', 'Search issues', this.openSearchDrawler.bind(this)),
      new NavItem('plus', 'Create issue', this.openCreateIssueModal.bind(this))
      // Removed project settings navigation temporarily
    ];

    this.bottomItems = [
      new NavItem('arrow-left', 'Go to Home', this.goToHome.bind(this)),
      new NavItem('poweroff', 'Logout', this.logout.bind(this))
    ];
  }

  openCreateIssueModal() {
    this._modalService.create({
      nzContent: AddIssueModalComponent,
      nzClosable: false,
      nzFooter: null,
      nzWidth: 700
    });
  }

  openSearchDrawler() {
    this._drawerService.create({
      nzContent: SearchDrawerComponent,
      nzTitle: null,
      nzPlacement: 'left',
      nzClosable: false,
      nzWidth: 500
    });
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

class NavItem {
  constructor(public icon: string, public tooltip: string, public handler: Handler) {}
}

type Handler = () => void;
