import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastrComponent } from './shared/components/toastr/toastr.component';
import { ToastrService } from './core/services/toastr.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastrComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit {
  title = 'frontend';

  @ViewChild(ToastrComponent) toastrComponent!: ToastrComponent;

  constructor(private toastrService: ToastrService) {}

  ngAfterViewInit(): void {
    // Register the ToastrComponent with the service
    this.toastrService.registerComponent(this.toastrComponent);
  }
}
